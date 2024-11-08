import React from "react";

const Sidebar = ({ toggleSidebarWidth }) => {
  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        height: "100%",
        padding: "10px",
        boxSizing: "border-box",
        transition: "width 0.3s ease",
      }}
    >
      <button onClick={toggleSidebarWidth}>토글 사이드바 너비</button>
      {/* 기타 사이드바 내용 */}
    </div>
  );
};

export default Sidebar;