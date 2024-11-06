import React, { useState } from 'react'

const Sidebar = ({ toggleSidebarWidth }) => {
  const [toggle, setToggle] = useState(false);
  
  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        height: "100%",
        padding: "10px",
      }}
    >
      <button onClick={toggleSidebarWidth}>토글 버튼</button>
    </div>
  )
}

export default Sidebar
