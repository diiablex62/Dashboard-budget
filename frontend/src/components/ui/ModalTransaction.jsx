import React from "react";
import { ModalDepenseRevenu } from "./Modal";

const ModalTransaction = ({
  visible,
  onClose,
  onSave,
  steps,
  initialValues,
  categories,
  title,
}) => {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={handleBackdropClick}>
      <ModalDepenseRevenu
        visible={visible}
        onClose={onClose}
        onSave={onSave}
        initialValues={initialValues}
        categories={categories}
        title={title}
        editMode={!!initialValues?.id}
      />
    </div>
  );
};

export default ModalTransaction;
