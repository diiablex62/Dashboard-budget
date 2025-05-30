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
  return (
    <ModalDepenseRevenu
      visible={visible}
      onClose={onClose}
      onSave={onSave}
      initialValues={initialValues}
      categories={categories}
      title={title}
      editMode={!!initialValues?.id}
    />
  );
};

export default ModalTransaction;
