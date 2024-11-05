// src/components/CanvasModal.tsx

/** @jsxImportSource @emotion/react */
"use client";

import React, { useEffect, useRef, useState } from "react";

import { css } from "@emotion/react";

import { CanvasModalProps, ModalInputValue } from "../types";

const ModalStyle = (modalPos: { x: number; y: number }) => css`
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

const CanvasModal: React.FC<CanvasModalProps> = ({
  modalPos,
  onDelete,
  onModalInputUpdate,
  setShowModal,
  currentData,
  onPhotoUpload,
}) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalInputValue, setModalInputValue] = useState<ModalInputValue>({ tag: "", description: "" });

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

  const handleChangeModalForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModalInputValue((prevState) => ({ ...prevState, [name]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowModal]);

  const handleAddPhotoMount = (photo: string) => {
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
            const file = e.target.files![0];
            if (!file) return;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
              if (reader.readyState === FileReader.DONE) handleAddPhotoMount(e.target!.result as string);
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
