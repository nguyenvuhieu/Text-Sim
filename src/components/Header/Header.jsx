import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import path from "../../constants/path";
import { AppContext } from "../../contexts/app.context";
import { setLocaleToLS } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo.png";
import { locales } from "../../i18n/i18n";

const Header = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation("common");

  const { locale, setLocale } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);

  const pages = [
    { name: t("home"), href: path.home },
    { name: t("about"), href: path.about },
    { name: t("product"), href: path.product },
    { name: t("data"), href: path.data },
    { name: t("corpus"), href: path.corpus }
  ];
  const languages = [
    { name: "English", value: "en" },
    { name: "Tiếng Việt", value: "vi" }
  ];

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  const toggleMenuLanguage = () => {
    setOpenLanguage((prev) => !prev);
  };

  const handleChangeLocale = (value) => {
    if (value !== locale) {
      setLocale(value);
      setLocaleToLS(value);
      i18n.changeLanguage(value);
    }

    setOpenLanguage(false);
  };

  return (
    <nav className="sticky top-0 z-40 flex-none w-full mx-auto bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-600">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl p-4 mx-auto">
        <Link to={path.home} className="flex items-center">
          <img src={logo} className="h-8 mr-3" alt="TextSim Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">TextSim</span>
        </Link>
        <div className="flex items-center space-x-4 md:order-2">
          <div className="relative">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              className="text-white w-[130px] justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
              onClick={toggleMenuLanguage}
            >
              {locales[locale]}
              <svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              id="dropdown"
              className={`absolute mt-3 z-10 right-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 ${
                !openLanguage ? "hidden" : ""
              }`}
            >
              <ul className="text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                {languages.map((language) => (
                  <li
                    key={language.value}
                    className="cursor-pointer first:rounded-tl-lg first:rounded-tr-lg last:rounded-bl-lg last:rounded-br-lg"
                    onClick={() => handleChangeLocale(language.value)}
                  >
                    <span className="block px-4 py-2 rounded-[inherit] hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                      {language.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            data-collapse-toggle="mobile-menu-language-select"
            type="button"
            className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mobile-menu-language-select"
            aria-expanded="false"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              aria-hidden="true"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${!open ? "hidden" : ""}`}
          id="mobile-menu-language-select"
        >
          <ul className="flex flex-col p-4 mt-4 font-medium border border-gray-100 rounded-lg md:p-0 bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 dark:border-gray-700">
            {pages.map((page) => (
              <li key={page.name}>
                <NavLink
                  to={page.href}
                  className={({ isActive }) =>
                    `text-sm font-medium text-gray-900 hover:text-blue-700 dark:hover:text-blue-500 ${
                      isActive ? "text-blue-500 dark:text-blue-700" : "text-gray-900 dark:text-gray-300"
                    }`
                  }
                >
                  {page.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
