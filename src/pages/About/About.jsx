import React from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation("about");

  const teams = [
    {
      name: "Nguyễn Vũ Hiếu",
      id: 20120478,
    },
    {
      name: "Đoàn Văn Thanh An",
      id: 18120109,
    }
  ];

  return (
    <div className="flex flex-col py-20">
      <Helmet>
        <title>{t("titlePage")}</title>
        <meta name="description" content="Trang chủ dự án TranslateHub" />
      </Helmet>
      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6 ">
          <div className="max-w-screen-sm mx-auto mb-8 text-center lg:mb-16">
            <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {t("titleStory")}
            </h2>
            <p className="font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400">{t("descStory")}</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="max-w-screen-xl px-4 py-8 mx-auto lg:py-16 lg:px-6 ">
          <div className="max-w-screen-sm mx-auto mb-8 text-center lg:mb-16">
            <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {t("titleMeet")}
            </h2>
          </div>
          <div className="grid gap-8 mb-6 lg:mb-16 md:grid-cols-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="items-center w-full rounded-lg shadow bg-gray-50 sm:flex dark:bg-gray-800 dark:border-gray-700"
              >
                {team.image ? (
                  <img
                    className="w-[150px] lg:w-[200px] rounded-lg sm:rounded-none sm:rounded-l-lg"
                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png"
                    alt="Bonnie Avatar"
                  />
                ) : (
                  <div className="relative w-[150px] lg:w-[200px] h-[150px] lg:h-[200px] overflow-hidden bg-gray-100 dark:bg-gray-600">
                    <svg
                      className="absolute w-full h-full text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-grow h-full p-5">
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{team.name}</h3>
                  <p className="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">{team.mail}</p>
                  <ul className="flex space-x-4 sm:mt-0">
                    <li>
                      <span className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </li>
                    <li>
                      <span className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </span>
                    </li>
                    <li>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
