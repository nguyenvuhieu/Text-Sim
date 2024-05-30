import React from "react";
import path from "../../constants/path";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import notFound from "../../assets/images/notFound.png";

const NotFound = () => {
  const { t } = useTranslation("notFound");

  return (
    <div>
      <Helmet>
        <title>{t("titlePage")}</title>
        <meta name="description" content="Trang chủ dự án TextSim" />
      </Helmet>
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6">
          <div className="max-w-screen-sm mx-auto text-center">
            <img src={notFound} alt="404 Not Found" className="mx-auto mb-4 w-[600px] h-[600px] object-cover" />
            <h1 className="mb-4 font-extrabold tracking-tight text-7xl lg:text-9xl text-primary-600 dark:text-white">
              404
            </h1>
            <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
              {t("titleError")}
            </p>
            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400"> {t("descError")}</p>
            <Link
              to={path.home}
              className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
            >
              {t("backToHomepage")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
