import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { create } from 'zustand';

type DropdownStore = {
  dropDownKey: string;
  setDropDownKey: (key: string) => void;
};

export const useDropdown = create<DropdownStore>(set => ({
  dropDownKey: '',
  setDropDownKey: key => set({ dropDownKey: key }),
}));

export const useDropdownRouteReset = () => {
  const pathName = usePathname();
  const setDropDownKey = useDropdown(state => state.setDropDownKey);

  useEffect(() => {
    setDropDownKey('');
  }, [pathName]);
};
