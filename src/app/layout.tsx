import { Pretendard } from "../../public/fonts";

import "./globals.css";

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
      <head>
        <script async src="https://docs.opencv.org/master/opencv.js" type="text/javascript"></script>
      </head>
      <body className={Pretendard.className}>{children}</body>
    </html>
  );
};

export default Layout;