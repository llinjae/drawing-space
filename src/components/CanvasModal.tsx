/** @jsxImportSource @emotion/react */
"use client";

import React, { useEffect, useRef, useState } from "react";

import { css } from "@emotion/react";

const ModalStyle = (modalPos) => css`
  position: absolute;
  top: ${modalPos.y}px;
  left: ${modalPos.x}px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: white;
  padding: 10px;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const photoMountsContainerStyle = css`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const photoMountStyle = css`
  border-radius: 50%;
  overflow: hidden;
`;

const CanvasModal = ({ modalPos, onDelete, onModalInputUpdate, setShowModal, currentData, onPhotoUpload }) => {
  const photoRef = useRef(null);
  const modalRef = useRef();
  const [modalInputValue, setModalInputValue] = useState({ tag: "", description: "" });

  useEffect(() => {
    if (currentData) {
      setModalInputValue({
        tag: currentData.tag || "",
        description: currentData.description || "",
      });
    } else {
      setModalInputValue({ tag: "", description: "" });
    }
  }, [currentData]);

  const handleChangeModalForm = (e) => {
    const { name, value } = e.target;
    setModalInputValue((prevState) => ({ ...prevState, [name]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowModal]);

  const handleAddPhotoMount = (photo) => {
    onPhotoUpload(photo);
  };

  return (
    <div ref={modalRef} css={ModalStyle(modalPos)}>
      <input
        type="text"
        name="tag"
        value={modalInputValue.tag}
        onChange={handleChangeModalForm}
        placeholder="태그를 입력해주세요."
      />
      <input
        type="text"
        name="description"
        value={modalInputValue.description}
        onChange={handleChangeModalForm}
        placeholder="상세 설명을 추가해주세요."
      />
      <div>
        <input
          ref={photoRef}
          style={{ display: "none" }}
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
              if (reader.readyState === reader.DONE) handleAddPhotoMount(e.target.result);
            };
          }}
        />
      </div>
      <button onClick={() => photoRef.current?.click()}>사진대지 추가</button>
      <button onClick={() => onModalInputUpdate(modalInputValue)}>확인</button>
      <button onClick={onDelete}>삭제</button>
    </div>
  );
};

export default CanvasModal;
