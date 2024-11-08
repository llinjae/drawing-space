"use client";

import React, { useState } from "react";

import Canvas from "@/components/Canvas";
import Sidebar from "@/components/Sidebar";

export default function Page() {
  const [sidebarWidth, setSidebarWidth] = useState(200);

  const toggleSidebarWidth = () => {
    setSidebarWidth((prevWidth) => (prevWidth === 200 ? 64 : 200));
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: `${sidebarWidth}px auto`,
        transition: "grid-template-columns 0.3s ease",
      }}
    >
      <Sidebar toggleSidebarWidth={toggleSidebarWidth} />
      <Canvas sidebarWidth={sidebarWidth} />
    </div>
  );
}