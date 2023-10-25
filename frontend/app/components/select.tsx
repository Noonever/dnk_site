import React, { useState, useEffect, useRef } from 'react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    defaultValue?: string;
    onChange: (selectedValue: string) => void;
    style?: any
    disabled?: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, defaultValue, onChange, style, disabled }) => {
    const [selectedOption, setSelectedOption] = useState<Option>({
        label: options[0].label,
        value: options[0].value,
    });
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const handleSelectClick = () => {
        if (disabled === true) {
            return
        }
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value: string, label: string) => {
        setSelectedOption({ label: label, value: value });
        onChange(value);
        setIsOpen(false);
    };

    const handleDocumentClick = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    return (
        <div style={style} className={`custom-select ${disabled ? 'disabled' : ''}`} ref={selectRef} onClick={handleSelectClick}>
            <div className="select-header">
                <div className="selected-value">{selectedOption.label}</div>
                <div className={`dropdown-icon ${isOpen ? 'open' : ''}`}>▼</div>
            </div>
            {isOpen && (
                <ul className='options' style={{ borderRadius: style?.borderRadius }}>
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleOptionClick(option.value, option.label)}
                            className={`option ${option.value === selectedOption.value ? 'selected' : ''}`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelect;
