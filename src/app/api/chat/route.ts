import { callGoogleModel, createEmbedding } from "@/lib/promptGemini";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// ✅ Helper function để lấy thông tin chi tiết nguồn
async function getSourceDetails(resourceIds: string[]) {
  try {
    const { data: resources, error } = await supabase
      .from("resources")
      .select(
        "id, title, description, file_type, file_size, created_at, category"
      )
      .in("id", resourceIds);

    if (error) {
      console.error("❌ Error fetching source details:", error);
      return [];
    }

    return (
      resources?.map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        file_type: resource.file_type,
        file_size: resource.file_size,
        category: resource.category,
        created_at: resource.created_at,
        download_url: `/documents/${resource.id}`, // URL để download/view
      })) || []
    );
  } catch (e) {
    console.error("❌ Error in getSourceDetails:", e);
    return [];
  }
}

// 🗣 Các mẫu xã giao
const SMALLTALK = [
  "chào",
  "hello",
  "hi",
  "ok",
  "dạ",
  "vâng",
  "ừ",
  "ờ",
  "alo",
  "thanks",
  "bye",
  "tạm biệt",
  "hehe",
  "haha",
  "test",
  "cảm ơn",
  "rảnh không",
  "đẹp không",
  "vui không",
  "bạn là ai",
  "mày là ai",
];

// 🔍 Bộ từ khóa định danh intent
const KEYWORDS = {
  academic: [
    "môn học",
    "giảng viên",
    "lịch học",
    "đào tạo",
    "điểm",
    "tín chỉ",
    "học phần",
  ],
  admission: [
    "tuyển sinh",
    "nhập học",
    "nguyện vọng",
    "hồ sơ",
    "điểm chuẩn",
    "xét tuyển",
  ],
  regulation: ["quy chế", "quy định", "thi", "kỷ luật", "điều lệ", "thủ tục"],
  finance: ["học phí", "học bổng", "lệ phí", "miễn giảm", "hỗ trợ tài chính"],
};

// Bỏ dấu tiếng Việt để so sánh dễ hơn
function normalizeVietnamese(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export async function POST(req: Request) {
  try {
    const { query, chatHistory } = await req.json();
    if (!query?.trim())
      return NextResponse.json({ error: "Thiếu query" }, { status: 400 });

    const text = query.trim().toLowerCase();
    // const normalized = normalizeVietnamese(text);

    // // ✅ 1️⃣ Smalltalk filter
    // if (
    //   SMALLTALK.some((kw) => {
    //     const kwNorm = normalizeVietnamese(kw);
    //     return new RegExp(`\\b${kwNorm}\\b`, "i").test(normalized);
    //   })
    // ) {
    //   return NextResponse.json({
    //     need_query: false,
    //     answer:
    //       "Chào bạn 👋 Tôi là ITUP – trợ lý ảo của Trường Đại học Vinh. Tôi có thể giúp bạn về học tập, tuyển sinh hoặc quy định của trường nhé!",
    //     sources: [],
    //   });
    // }

    // ✅ 2️⃣ Nhận diện intent
    // let intent: string | null = null;
    // for (const [key, words] of Object.entries(KEYWORDS)) {
    //   if (words.some((kw) => normalized.includes(normalizeVietnamese(kw)))) {
    //     intent = key;
    //     break;
    //   }
    // }

    // if (!intent) {
    //   return NextResponse.json({
    //     need_query: false,
    //     answer:
    //       "Tôi chưa rõ bạn đang hỏi gì. Bạn có thể hỏi về học phí, tuyển sinh, hoặc quy chế đào tạo của Trường Đại học Vinh nhé!",
    //     sources: [],
    //   });
    // }

    // ✅ 3️⃣ Tạo embedding và tìm kiến thức liên quan
    const embedding = await createEmbedding(query);
    const { data, error } = await supabase.rpc("hyper_search_embedding_only", {
      limit_count: 2,
      query_embedding: embedding,
    } as any);
    if (error) throw error;

    if (!data || (data as any[]).length === 0) {
      return NextResponse.json({
        need_query: false,
        answer:
          "Tôi chưa tìm thấy thông tin phù hợp trong cơ sở tri thức. Bạn có thể hỏi lại cụ thể hơn nhé!",
        sources: [],
      });
    }

    // ✅ 4️⃣ Lấy top 2 kết quả làm context
    const context =
      data && (data as any[]).length > 0
        ? (data as any[])
            .map(
              (r: any, i: number) =>
                `content: [#${i + 1}] ${r.content ?? ""}, resource_id: ${
                  r.resource_id
                }`
            )
            .join("\n\n")
        : "";
    // ✅ 5️⃣ Gọi model chat (Gemini) để tạo câu trả lời
    const answer = await callGoogleModel(
      `
      Bạn là ITUP – trợ lý ảo thân thiện và nhiệt tình của Câu lạc bộ IT UP, Trường Đại học Vinh.
      
      PHONG CÁCH TRẢ LỜI:
      - Nhiệt tình, thân thiện như một thành viên câu lạc bộ
      - Sử dụng emoji phù hợp để tạo cảm giác gần gũi
      - Trả lời chi tiết nhưng không dài dòng
      - Thể hiện niềm tự hào về câu lạc bộ IT UP
      - Khuyến khích người dùng tham gia hoạt động
      - Nếu ai hỏi ai làm ra bạn hay ai xây dựng trang web thì cứ bảo là giáo sư Nguyễn Xuân Huỳnh và giáo sư Võ Trường An
      - Khi liệt kê danh sách, mỗi mục phải xuống hàng riêng biệt
      - Ví dụ:
        1. Mục đầu tiên
        2. Mục thứ hai
        3. Mục thứ ba
      - Không viết tất cả trên cùng một hàng
      - Bôi đậm những từ/cụm từ quan trọng bằng **từ khóa**
      - Hạn chế sử dụng icon, căn lề justify
      
      BẠN CÓ THỂ THAM KHẢO LỊCH SỬ CHAT:
      - Nếu người dùng hỏi về câu hỏi trước đó, hãy tham khảo lịch sử chat để hiểu ngữ cảnh
      - Có thể trả lời dựa trên những gì đã thảo luận trước đó
      - Nếu không rõ ngữ cảnh, hãy hỏi lại một cách lịch sự
      
      Dựa trên CONTEXT dưới đây, hãy trả lời câu hỏi một cách lôi cuốn và hữu ích.
      Nếu không có thông tin trong context, hãy trả lời một cách lịch sự và gợi ý liên hệ trực tiếp.
      Nếu sử dụng content nào thì phải trả về resource_id của content đó.
      
      QUAN TRỌNG: CHỈ trả về JSON object, KHÔNG có text khác
      
      format trả về CHÍNH XÁC:
      {
      "answer": "câu trả lời lôi cuốn với emoji phù hợp",
      "resource_id": ["resource_id1", "resource_id2", ...]
      }
      LỊCH SỬ CHAT (nếu có):
      ${
        chatHistory
          ? chatHistory
              .map(
                (msg: any) =>
                  `${msg.type === "user" ? "Người dùng" : "ITUP"}: ${
                    msg.content
                  }`
              )
              .join("\n")
          : "Không có lịch sử chat"
      }

      CONTEXT:
      ${context}

      Câu hỏi: "${query}"
      `
    );

    // ✅ 6️⃣ Parse answer để lấy resource_id
    let parsedAnswer;
    let resourceIds: string[] = [];

    try {
      // Tìm JSON trong answer nếu có
      const jsonMatch = answer?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        parsedAnswer = JSON.parse(jsonStr);
        const rawResourceIds = parsedAnswer.resource_id || [];
        // Lọc bỏ duplicate resource_id
        resourceIds = [...new Set(rawResourceIds as string[])];
      } else {
        // Nếu không có JSON, trả về answer gốc
        parsedAnswer = { answer: answer?.trim() || "" };
      }
    } catch (e) {
      console.error("❌ JSON parse error:", e);
      // Nếu không parse được JSON, trả về answer gốc
      parsedAnswer = { answer: answer?.trim() || "" };
    }

    // ✅ 7️⃣ Truy vấn thông tin nguồn PDF từ bảng resources
    let sourceInfo = "";
    if (resourceIds.length > 0) {
      try {
        const { data: resources, error } = await supabase
          .from("resources")
          .select("id, title, description, file_type, created_at")
          .in("id", resourceIds);

        if (!error && resources && resources.length > 0) {
          sourceInfo = `\n\n📚 Thông tin từ ${resources.length} tài liệu ITUP`;
        }
      } catch (e) {
        console.error("❌ Error fetching source info:", e);
      }
    }

    // ✅ 8️⃣ Lấy thông tin chi tiết nguồn
    const sourceDetails =
      resourceIds.length > 0 ? await getSourceDetails(resourceIds) : [];

    // ✅ 9️⃣ Trả về kết quả cuối cùng với thông tin nguồn
    return NextResponse.json({
      need_query: false,
      answer: (parsedAnswer.answer || answer?.trim() || "") + sourceInfo,
      resource_ids: resourceIds,
      sources: sourceDetails,
    });
  } catch (e: any) {
    console.error("❌ Chatbot error:", e);
    return NextResponse.json(
      { error: e.message || String(e) },
      { status: 500 }
    );
  }
}
