import "./globals.css";

import { Pretendard } from "../../public/fonts";

export const metadata = {
  title: "UPSIGHT - 업사이트",
  description: "upsight",
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
  return (
    <html lang="ko">
      <body className={Pretendard.className}>
        {children}
      </body>
    </html>
  );
};

export default Layout;
