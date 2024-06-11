import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo.png";
import { Helmet } from "react-helmet-async";
import "./Data.css";
const MAXIMUM_NUMBER_OF_CHARACTERS = 1000;
const HOST = "http://127.0.0.1:8000";
const lev_array = [1, 2, 3, 4, 5];

const Data = () => {
  const { t } = useTranslation("data");
  const [inputs1, setInputs1] = useState("");
  const [inputs2, setInputs2] = useState("");
  const [numberOfCharacters1, setNumberOfCharacters1] = useState(0);
  const [numberOfCharacters2, setNumberOfCharacters2] = useState(0);
  const [similarityLabel, setSimilarityLabel] = useState(0);
  const [datasets, setDatasets] = useState([]);
  const [datagroups, setDataGroups] = useState([]);
  const [editDataIndex, setEditDataIndex] = useState(null);
  const [editFirstSentence, setEditFirstSentence] = useState("");
  const [editSecondSentence, setEditSecondSentence] = useState("");
  const [editSimilarity, setEditSimilarity] = useState(0);
  const [selectedDataGroup, setSelectedDataGroup] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [IsPopUpAddGroup, setIsPopUpAddGroup] = useState(false);
  const [IsPopUpDelGroup, setIsPopUpDelGroup] = useState(false);
  const [isPopUpEditData, setIsPopUpEditData] = useState(false);
  const [isPopUpDelData, setIsPopUpDelData] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isAddDataPopup, setIsAddDataPopup] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupScoreType, setNewGroupScoreType] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL"); // Ngôn ngữ mặc định
  const [selectedSimilarity, setSelectedSimilarity] = useState("COS_SIM"); // Loại so sánh mặc định
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tạo một instance Axios riêng
  const api = axios.create();

  // Thêm request interceptor
  api.interceptors.request.use(
    (config) => {
      setLoading(true); // Bật loading trước khi gửi request
      return config;
    },
    (error) => {
      setLoading(false); // Tắt loading nếu có lỗi
      return Promise.reject(error);
    }
  );

  // Thêm response interceptor
  api.interceptors.response.use(
    (response) => {
      setLoading(false); // Tắt loading sau khi nhận response
      return response;
    },
    (error) => {
      setLoading(false); // Tắt loading nếu có lỗi
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDataSet(); // Gọi fetchDataSet ngay khi selectedDataGroup thay đổi
    setShowTable(true); // Luôn hiển thị bảng dữ liệu
  }, [selectedDataGroup]);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`${HOST}/dataset`);

      setDataGroups(data.datasets);
    } catch (error) {
      alert(t("errorFetchingData"), error);
    }
  };

  const fetchDataSet = async () => {
    try {
      const response = await api.get(`${HOST}/dataset/${selectedDataGroup.id}/records?skip=0&limit=10`);
      setDatasets(response.data.documents);
    } catch (error) {
      console.error(t("errorFetchingData"), error);
    }
  };

  const handleChangeInput1 = (e) => {
    const lengthOfCharacters = e.target.value.length;

    if (lengthOfCharacters <= MAXIMUM_NUMBER_OF_CHARACTERS) {
      setNumberOfCharacters1(lengthOfCharacters);
      setInputs1(e.target.value);
    } else {
      const value = e.target.value.slice(0, MAXIMUM_NUMBER_OF_CHARACTERS);
      setNumberOfCharacters1(value.length);
      setInputs1(value);
    }
  };
  const handleChangeInput2 = (e) => {
    const lengthOfCharacters = e.target.value.length;

    if (lengthOfCharacters <= MAXIMUM_NUMBER_OF_CHARACTERS) {
      setNumberOfCharacters2(lengthOfCharacters);
      setInputs2(e.target.value);
    } else {
      const value = e.target.value.slice(0, MAXIMUM_NUMBER_OF_CHARACTERS);
      setNumberOfCharacters2(value.length);
      setInputs2(value);
    }
  };
  const handleSimilarityLabelChange = (e) => {
    if (selectedDataGroup.similarity_type === "COS_SIM") {
      let value = parseFloat(e.target.value);
      if (isNaN(value) || value < 0 || value > 1) {
        setErrorMessage(t("invalidSimilarityValue") + "(0 - 1)");
        return;
      }
      setSimilarityLabel(value);
    } else if (selectedDataGroup.similarity_type === "LEVEL") {
      let value = parseInt(e.target.value, 10); // Chuyển sang số nguyên
      if (isNaN(value) || value < 0 || value > 5) {
        setErrorMessage(t("invalidSimilarityValue") + "(0 - 5)");
        return;
      }
      setSimilarityLabel(value);
    } else {
      setSimilarityLabel(e.target.value === "true"); // Chuyển đổi thành boolean
    }
    setErrorMessage(""); // Xóa thông báo lỗi nếu có
  };

  const handleSimilarityLabelChange1 = (e) => {
    let value = parseFloat(e.target.value);

    // Kiểm tra nếu giá trị nhập vào không nằm trong khoảng từ 0 đến 1
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 1) {
      value = 1;
    }

    setSimilarityLabel(value);
  };

  const handleAddData = async () => {
    try {
      // Kiểm tra các trường input1 và input2
      if (!inputs1 || !inputs2 || similarityLabel === "") {
        setErrorMessage(t("enterFullInformation"));
        setIsAddDataPopup(true);
        return;
      }

      const newData = {
        dataset_id: selectedDataGroup.id, // Thêm _id của dataset vào dữ liệu mới
        first_sentence: inputs1,
        second_sentence: inputs2,
        similarity: similarityLabel
      };

      await api.post(`${HOST}/dataset/record`, newData);

      // Hiển thị popup thành công
      setIsAddDataPopup(true);
      // Sau khi thêm dữ liệu thành công, bạn có thể gọi lại hàm fetchData để cập nhật dữ liệu
      fetchData();
    } catch (error) {
      console.error(t("errorAddingData"), error);
      setErrorMessage(error.message);
      // Hiển thị popup lỗi
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get(`${HOST}/dataset/${selectedDataGroup.id}/records`);
      const datasets = response.data.documents;

      // Tạo tiêu đề cho file CSV (điều chỉnh dựa trên selectedSimilarity)
      const csvHeader = `\uFEFFFirst Sentence,Second Sentence,${
        selectedSimilarity === "BOOL" ? "Similar (True/False)" : "Similarity"
      }\n`;

      let csvContent = "";
      datasets.forEach((data) => {
        const { first_sentence, second_sentence, similarity } = data;
        const formattedSimilarity = selectedSimilarity === "BOOL" ? (similarity ? "True" : "False") : similarity;

        csvContent += `"${first_sentence.replace(/"/g, '""')}","${second_sentence.replace(
          /"/g,
          '""'
        )}",${formattedSimilarity}\n`;
      });

      const csv = csvHeader + csvContent;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedDataGroup.name}-data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportPopup(true);
      setErrorMessage(null);
    } catch (error) {
      console.error(t("errorExportingData"), error);
      setShowExportPopup(true);
      setErrorMessage(error.message);
    }
  };

  const handleUpdateClick = (index) => {
    setEditDataIndex(index);
    setEditFirstSentence(datasets[index].first_sentence);
    setEditSecondSentence(datasets[index].second_sentence);
    setEditSimilarity(datasets[index].score);
    setIsPopUpEditData(true);
  };

  const handleSaveClick = async (index) => {
    let hasError = false;
    let editSimilarityValue = editSimilarity; // Biến tạm để lưu giá trị editSimilarity trước khi chuyển đổi

    if (!editFirstSentence || !editSecondSentence || editSimilarity === "") {
      setErrorMessage(t("enterFullInformationAllFields"));
      hasError = true;
    } else {
      switch (selectedDataGroup.similarity_type) {
        case "COS_SIM":
          editSimilarityValue = parseFloat(editSimilarity);
          if (isNaN(editSimilarityValue) || editSimilarityValue < 0 || editSimilarityValue > 1) {
            setErrorMessage(t("invalidCosSimRange"));
            hasError = true;
          }
          break;
        case "LEVEL":
          if (editSimilarity !== 0) {
            editSimilarityValue = parseInt(editSimilarity, 10);
          } // Chuyển đổi sang số nguyên
          if (editSimilarityValue > 5) {
            // Kiểm tra giá trị hợp lệ
            setErrorMessage(t("invalidLevelRange"));
            hasError = true;
          }
          break;

        case "BOOL":
          editSimilarityValue = editSimilarity === "true";
          break;
        default:
          setErrorMessage(t("invalidSimilarityType"));
          hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    try {
      const updatedData = {
        first_sentence: editFirstSentence,
        second_sentence: editSecondSentence,
        similarity: editSimilarityValue // Sử dụng trường "similarity"
      };
      alert(JSON.stringify(updatedData));
      await api.put(`${HOST}/dataset/record/${datasets[editDataIndex]._id}`, updatedData);

      fetchDataSet();
      setEditDataIndex(-1);
      setErrorMessage("");
      setIsPopUpEditData(false);
    } catch (error) {
      setErrorMessage(t("errorEditing"));
    }
  };

  const handleDeleteClick = (index) => {
    setEditDataIndex(index);
    setIsPopUpDelData(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`${HOST}/dataset/record/${datasets[editDataIndex]._id}`);

      // Sau khi xóa dữ liệu thành công, bạn có thể gọi lại hàm fetchDataSet để cập nhật dữ liệu
      fetchDataSet();
      setIsPopUpDelData(false);
      setEditDataIndex(null);
    } catch (error) {
      console.error(t("errorDeletingData"), error);
    }
  };
  const handleDataGroupChange = (event) => {
    const selectedGroupId = event.target.value;
    const selectedGroup = datagroups.find((group) => group._id === selectedGroupId);
    // Cập nhật selectedDataGroup với id, name và similarity_type tương ứng
    setSelectedDataGroup({
      id: selectedGroup._id,
      name: selectedGroup.name,
      similarity_type: selectedGroup.similarity_type // Thêm similarity_type
    });
    setSimilarityLabel("");
    setShowTable(false);
  };

  const handlePopUpClose = () => {
    setIsPopUpAddGroup(false);
    setNewGroupName("");
    setNewGroupScoreType("");
    setErrorMessage("");
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !selectedLanguage || !selectedSimilarity) {
      setErrorMessage("*Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const newGroup = {
        name: newGroupName,
        language: selectedLanguage,
        similarity_type: selectedSimilarity // Sử dụng similarity_type thay vì score_type
      };

      await api.post(`${HOST}/dataset`, newGroup);
      fetchData();
      setIsPopUpAddGroup(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating new group:", error);
      setErrorMessage(t("errorCreatingNewGroup") + error.response.data.detail);
    }
  };
  const handleDeleteGroup = async () => {
    // Kiểm tra xem đã chọn nhóm để xóa chưa
    if (!selectedDataGroup.id) {
      // Nếu chưa chọn nhóm, hiển thị thông báo lỗi và không thực hiện xóa
      setErrorMessage(t("selectGroupToDelete"));
      return;
    }

    try {
      // Gửi yêu cầu xóa nhóm dữ liệu
      await api.delete(`${HOST}/dataset/${selectedDataGroup.id}`);
      // Xóa thành công, cập nhật lại danh sách nhóm dữ liệu
      fetchData();
      setIsPopUpDelGroup(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error deleting group:", error);
      // Xảy ra lỗi khi xóa nhóm dữ liệu
      // Xử lý lỗi ở đây, ví dụ hiển thị thông báo lỗi
      setErrorMessage(t("errorDeletingGroup") + error.response.data.detail);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto my-16 min-h-[800px]">
      <Helmet>
        <title>{t("titlePage")}</title>
      </Helmet>
      <div className="p-8">
        <div className="flex items-center justify-center">
          <img src={logo} className="h-20 mr-6" alt="TextSim Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap md:text-5xl">TextSim</span>
        </div>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="text-left pr-4">
          <p className="text-gray-600">{t("selectDataGroup")}</p>
        </div>
        <select
          value={selectedDataGroup.id}
          onChange={handleDataGroupChange}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0"
        >
          {!selectedDataGroup.id && <option value={null}>{t("selectGroup")}</option>}
          {datagroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

        <button
          class="rounded-lg relative w-36 h-10 cursor-pointer flex items-center border border-blue-500 bg-blue-500 group hover:bg-blue-500 active:bg-blue-500 active:border-blue-500 mr-4 ml-6"
          onClick={() => setIsPopUpAddGroup(true)}
        >
          <span class="text-white font-semibold ml-2 transform group-hover:translate-x-5 transition-all duration-300">
            {t("addGroup")}
          </span>
          <span class="absolute right-0 h-full w-10 rounded-lg bg-blue-500 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
            <svg
              class="svg w-8 text-white"
              fill="none"
              height="24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="12" x2="12" y1="5" y2="19"></line>
              <line x1="5" x2="19" y1="12" y2="12"></line>
            </svg>
          </span>
        </button>
        {selectedDataGroup?.id && (
          <button class="delete-group" type="button" onClick={() => setIsPopUpDelGroup(true)}>
            <span class="delete-group__text">{t("deleteGroup")}</span>
            <span class="delete-group__icon">
              <svg class="svg" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
                <title></title>
                <path
                  d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"
                  className="delete-group-svg-path"
                ></path>{" "}
                <line x1="80" x2="432" y1="112" y2="112" className="delete-group-svg-path"></line>
                <path
                  d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"
                  className="delete-group-svg-path"
                ></path>
                <line x1="256" x2="256" y1="176" y2="400" className="delete-group-svg-path"></line>
                <line x1="184" x2="192" y1="176" y2="400" className="delete-group-svg-path"></line>
                <line x1="328" x2="320" y1="176" y2="400" className="delete-group-svg-path"></line>
              </svg>
            </span>
          </button>
        )}
      </div>
      {!selectedDataGroup?.id && <p className="text-center text-gray-600 mt-4">{t("pleaseSelectGroup")}</p>}
      {selectedDataGroup?.id && (
        <div className="flex items-center justify-center">
          <div className="flex flex-col justify-center w-2/5 mr-4">
            {/* Input 1 */}
            <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
              <div className="relative p-4 rounded-lg bg-gray-50">
                <textarea
                  id="search"
                  rows={5}
                  className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                  placeholder={t("placeholderText-1")}
                  required
                  value={inputs1}
                  onChange={handleChangeInput1}
                />
                <label htmlFor="text" className="absolute text-xs text-gray-900 opacity-70 right-4 bottom-4">
                  {numberOfCharacters1} / {MAXIMUM_NUMBER_OF_CHARACTERS}
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center w-2/5 ml-4">
            {/* Input 2 */}
            <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
              <div className="relative p-4 rounded-lg bg-gray-50">
                <textarea
                  id="search"
                  rows={5}
                  className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                  placeholder={t("placeholderText-1")}
                  required
                  value={inputs2}
                  onChange={handleChangeInput2}
                />
                <label htmlFor="text" className="absolute text-xs text-gray-900 opacity-70 right-4 bottom-4">
                  {numberOfCharacters2} / {MAXIMUM_NUMBER_OF_CHARACTERS}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thêm nhãn tương đồng, button Thêm dữ liệu và button Xuất file dữ liệu */}
      {/* Thêm nhãn tương đồng */}
      {selectedDataGroup?.id && (
        <div className="flex items-center justify-center mb-4">
          <div className="text-left pr-4">
            <p className="text-gray-600">{t("enterSimilarity")}</p>
          </div>

          {selectedDataGroup.similarity_type === "COS_SIM" && (
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={similarityLabel}
              onChange={handleSimilarityLabelChange}
              className="w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0 dark:text-white dark:bg-gray-800 dark:placeholder-gray-400 outline-0"
            />
          )}

          {selectedDataGroup.similarity_type === "LEVEL" && (
            <select
              value={similarityLabel}
              onChange={handleSimilarityLabelChange}
              className="w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0 dark:text-white dark:bg-gray-800 dark:placeholder-gray-400 outline-0"
            >
              {lev_array.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          )}

          {selectedDataGroup.similarity_type === "BOOL" && (
            <select
              value={similarityLabel ? "true" : "false"} // Hiển thị "true" hoặc "false"
              onChange={handleSimilarityLabelChange}
              className="w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0 dark:text-white dark:bg-gray-800 dark:placeholder-gray-400 outline-0"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          )}

          <button
            class="rounded-lg relative w-36 h-10 cursor-pointer flex items-center border border-green-500 bg-green-500 group hover:bg-green-500 active:bg-green-500 active:border-green-500 ml-4 mr-4"
            onClick={handleAddData}
          >
            <span class="text-white font-semibold ml-1 transform group-hover:translate-x-5 transition-all duration-300">
              {t("addData")}
            </span>
            <span class="absolute right-0 h-full w-8 rounded-lg bg-green-500 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
              <svg
                class="svg w-8 text-white"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="12" x2="12" y1="5" y2="19"></line>
                <line x1="5" x2="19" y1="12" y2="12"></line>
              </svg>
            </span>
          </button>

          <div
            className="download-button"
            data-tooltip={t("numberOfDatasets", { count: datasets.length })}
            onClick={handleExportData}
          >
            <div className="download-button-wrapper">
              <div className="download-button__text">{t("exportData")}</div>
              <span className="download-button__icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="2em"
                  height="2em"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"
                  ></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}
      {showTable && selectedDataGroup?.id && (
        <>
          <div className="table-container">
            <h2>{t("similarityDataTable")}</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="first-sentence-column">{t("firstSentence")}</th>
                    <th className="second-sentence-column">{t("secondSentence")}</th>
                    <th className="score-column">{t("score")}</th>
                    <th className="task-header">{t("task")}</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((data, index) => (
                    <tr key={index} className={editDataIndex === index ? "editing-row" : ""}>
                      <td>{data.first_sentence}</td>
                      <td>{data.second_sentence}</td>
                      <td className="score-column">
                        {
                          selectedDataGroup.similarity_type === "BOOL"
                            ? data.similarity
                              ? "True"
                              : "False" // Hiển thị True/False cho BOOL
                            : data.similarity // Hiển thị giá trị số cho các loại khác
                        }
                      </td>
                      <td className="task-buttons">
                        <button class="edit-button" onClick={() => handleUpdateClick(index)}>
                          {t("edit")}
                          <svg class="svg" viewBox="0 0 512 512">
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                          </svg>
                        </button>

                        <button class="bin-button" onClick={() => handleDeleteClick(index)}>
                          <svg class="bin-top" viewBox="0 0 39 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line y1="5" x2="39" y2="5" stroke="white" stroke-width="4"></line>
                            <line x1="12" y1="1.5" x2="26.0357" y2="1.5" stroke="white" stroke-width="3"></line>
                          </svg>
                          <svg class="bin-bottom" viewBox="0 0 33 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="path-1-inside-1_8_19" fill="white">
                              <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                            </mask>
                            <path
                              d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                              fill="white"
                              mask="url(#path-1-inside-1_8_19)"
                            ></path>
                            <path d="M12 6L12 29" stroke="white" stroke-width="4"></path>
                            <path d="M21 6V29" stroke="white" stroke-width="4"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {IsPopUpAddGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            {/* Trường nhập tên nhóm */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("groupName")}</label>
              <input
                type="text"
                value={newGroupName}
                placeholder={t("enterGroupNamePlaceholder")}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>

            {/* Trường chọn ngôn ngữ */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("language")}</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              >
                <option value="EN">Tiếng Anh</option>
                <option value="VN">Tiếng Việt</option>
                <option value="ALL">ALL</option>
              </select>
            </div>

            {/* Trường chọn loại so sánh */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("similarityType")}</label>
              <select
                value={selectedSimilarity}
                onChange={(e) => setSelectedSimilarity(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              >
                <option value="LEVEL">LEVEL (1-5)</option>
                <option value="COS_SIM">COS_SIM (0-1)</option>
                <option value="BOOL">TRUE-FALSE</option>
              </select>
            </div>
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            <div className="flex justify-end">
              <button
                onClick={() => handlePopUpClose()}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {t("create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {IsPopUpDelGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("deleteDataGroup")}</h2>
            <p className="mb-4 text-center">{t("confirmDeleteDataGroup")}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsPopUpDelGroup(false)}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isPopUpEditData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("editData")}</h2>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("sentence1")}</label>
              <input
                type="text"
                value={editFirstSentence}
                onChange={(e) => setEditFirstSentence(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("sentence2")}</label>
              <input
                type="text"
                value={editSecondSentence}
                onChange={(e) => setEditSecondSentence(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("score")}</label>
              {selectedDataGroup.similarity_type === "COS_SIM" && (
                <input
                  type="number"
                  value={editSimilarity}
                  onChange={(e) => setEditSimilarity(e.target.value)}
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
                />
              )}

              {selectedDataGroup.similarity_type === "LEVEL" && (
                <select
                  value={editSimilarity}
                  onChange={(e) => setEditSimilarity(e.target.value)}
                  className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
                >
                  {lev_array.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              )}

              {selectedDataGroup.similarity_type === "BOOL" && (
                <select
                  value={editSimilarity ? "true" : "false"}
                  onChange={(e) => setEditSimilarity(e.target.value)}
                  className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              )}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsPopUpEditData(false);
                  setErrorMessage(""); // Reset errorMessage khi đóng pop-up
                }}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopUpDelData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("deleteData")}</h2>
            <p className="mb-4 text-center">{t("confirmDeleteData")}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsPopUpDelData(false)}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddDataPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg">
            <h2 className={`mb-4 text-lg font-semibold ${errorMessage ? "text-red-600" : "text-green-600"}`}>
              {errorMessage ? errorMessage : t("addDataSuccess")}
            </h2>
            <button
              onClick={() => {
                setIsAddDataPopup(false);
                setErrorMessage("");
                fetchDataSet();
              }}
              className={`px-4 py-2 text-white ${
                errorMessage ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              } rounded-lg`}
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {showExportPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg">
            <h2 className={`mb-4 text-lg font-semibold ${errorMessage ? "text-red-600" : "text-green-600"}`}>
              {errorMessage ? errorMessage : t("exportFileSuccess")}
            </h2>
            <button
              onClick={() => {
                setShowExportPopup(false);
                setErrorMessage(null);
              }}
              className={`px-4 py-2 text-white ${
                errorMessage ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              } rounded-lg`}
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
      {/* Overlay và spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};
export default Data;
