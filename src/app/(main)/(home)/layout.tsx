import { ChatComponent } from "@/components/(home)/chat";
import Footer from "@/components/(home)/footer";
import Header from "@/components/(home)/header";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatComponent />
      {/* <ZaloButton />
      <PhoneButton /> */}
    </div>
  );
};

export default MainLayout;
