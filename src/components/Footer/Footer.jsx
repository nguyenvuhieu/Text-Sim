import React from "react";
import { Link } from "react-router-dom";
import path from "../../constants/path";
import logo from "../../assets/images/logo.png";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="p-4 border-t border-gray-200 shadow-md bg-gray-50 md:p-8 lg:p-10">
      <div className="max-w-screen-xl mx-auto text-center">
        <Link to={path.home} className="flex items-center justify-center text-2xl font-semibold text-gray-900">
          <img src={logo} className="h-8 mr-3" alt="TextSim Logo" />
          TextSim
        </Link>
        <p className="my-6 text-gray-500 ">{t("footerDesc")}</p>
        <span className="text-sm text-gray-500 sm:text-center ">© 2024 TextSim™. All Rights Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
