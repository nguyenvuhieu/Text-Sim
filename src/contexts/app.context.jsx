import { createContext, useState } from "react";
import { getLocaleFromLS} from "../utils/utils";

const initialAppContext = {
  locale: getLocaleFromLS(),
  setLocale: () => null
};

// initialAppContext là giá trị khởi tạo của Context nếu Provider không truyền vào props value
export const AppContext = createContext(initialAppContext);

export const AppProvider = ({ children }) => {
  const [locale, setLocale] = useState(initialAppContext.locale);

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
