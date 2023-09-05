interface FieldProps {
    alias: string;
    onChange: (value: string) => void;
    isValid: boolean;
    placeholder?: string;
}

const Field: React.FC<FieldProps> = ({ alias, onChange, isValid, placeholder}) => {
    return (
        <div>
            <label>{alias}</label>
            <input
                type="text"
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {isValid ? null : <span>Invalid input</span>}
        </div>
    );
};

export {Field};
export type { FieldProps };
