import { createContext, ReactNode, useContext, useState } from 'react';

type DropdownContextType = {
  dropDownKey: string;
  setDropDownKey: (key: string) => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined,
);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [dropDownKey, setDropDownKey] = useState('');

  return (
    <DropdownContext.Provider value={{ dropDownKey, setDropDownKey }}>
      {children}
    </DropdownContext.Provider>
  );
};

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown deve ser usado dentro de DropdownProvider');
  }
  return context;
};

export default useDropdown;
