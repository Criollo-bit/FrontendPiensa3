import React from 'react';
import './FloatingInput.css'; // Importamos los estilos de arriba

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  required?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ 
  id, label, type = "text", value, onChange, onFocus, onBlur, required = false 
}) => {
  return (
    <div className="floating-label-container">
      <input
        id={id}
        type={type}
        placeholder=" " /* El espacio es importante para el truco de CSS */
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="floating-input"
        required={required}
      />
      <label htmlFor={id} className="floating-label">
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;