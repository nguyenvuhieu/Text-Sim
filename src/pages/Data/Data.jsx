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
  const [searchTerm, setSearchTerm] = useState("");
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
  const [isChangeButtonVisible, setIsChangeButtonVisible] = useState(false);
  const [datasetConfig, setDatasetConfig] = useState(null); // State lưu trữ cấu trúc dataset
  const [selectedLanguage, setSelectedLanguage] = useState("ALL"); // Ngôn ngữ mặc định
  const [selectedSimilarity, setSelectedSimilarity] = useState("COS_SIM"); // Loại so sánh mặc định
  const [selectedModel, setSelectedModel] = useState(""); // Mô hình nhúng mặc định
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
      alert("Error fetching data:", error);
    }
  };

  const fetchDataSet = async () => {
    try {
      const response = await api.get(`${HOST}/dataset/${selectedDataGroup.id}/records?skip=0&limit=10`);
      setDatasets(response.data.documents);
    } catch (error) {
      console.error("Error fetching data:", error);
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
        setErrorMessage("Giá trị điểm tương đồng không hợp lệ (0 - 1).");
        return;
      }
      setSimilarityLabel(value);
    } else if (selectedDataGroup.similarity_type === "LEVEL") {
      let value = parseInt(e.target.value, 10); // Chuyển sang số nguyên
      if (isNaN(value) || value < 0 || value > 5) {
        setErrorMessage("Giá trị điểm tương đồng không hợp lệ (0 - 5).");
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
        setErrorMessage("Vui lòng điền đầy đủ thông tin.");
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
      console.error("Error adding data:", error);
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
      console.error("Error exporting data:", error);
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
      setErrorMessage("Vui lòng nhập đầy đủ thông tin cho tất cả các trường.");
      hasError = true;
    } else {
      switch (selectedDataGroup.similarity_type) {
        case "COS_SIM":
          editSimilarityValue = parseFloat(editSimilarity);
          if (isNaN(editSimilarityValue) || editSimilarityValue < 0 || editSimilarityValue > 1) {
            setErrorMessage("Điểm COS_SIM phải nằm trong khoảng từ 0 đến 1.");
            hasError = true;
          }
          break;
        case "LEVEL":
          if (editSimilarity !== 0) {
            editSimilarityValue = parseInt(editSimilarity, 10);
          } // Chuyển đổi sang số nguyên
          if (editSimilarityValue > 5) {
            // Kiểm tra giá trị hợp lệ
            setErrorMessage("Điểm LEVEL phải là số nguyên từ 0 đến 5.");
            hasError = true;
          }
          break;

        case "BOOL":
          editSimilarityValue = editSimilarity === "true";
          break;
        default:
          setErrorMessage("Loại similarity không hợp lệ.");
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
      setErrorMessage("Xảy ra lỗi trong quá trình chỉnh sửa");
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
      console.error("Error deleting data:", error);
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

  const handleCreateGroup1 = async () => {
    if (!newGroupName || !newGroupScoreType) {
      setErrorMessage("*Tên nhóm và loại điểm không được để trống.");
      return;
    }

    try {
      const newGroup = {
        name: newGroupName,
        score_type: newGroupScoreType
      };

      await api.post(`${HOST}/dataset`, newGroup);
      fetchData();
      setIsPopUpAddGroup(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating new group:", error);
      setErrorMessage("*Lỗi khi tạo nhóm mới: " + error.response.data.detail);
    }
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
      setErrorMessage("*Lỗi khi tạo nhóm mới: " + error.response.data.detail);
    }
  };
  const handleDeleteGroup = async () => {
    // Kiểm tra xem đã chọn nhóm để xóa chưa
    if (!selectedDataGroup.id) {
      // Nếu chưa chọn nhóm, hiển thị thông báo lỗi và không thực hiện xóa
      setErrorMessage("Vui lòng chọn nhóm để xóa.");
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
      setErrorMessage("Lỗi khi xóa nhóm: " + error.response.data.detail);
    }
  };
  const handleDataGroupChangeButton = (selectedGroupId) => {
    // Tìm groupName tương ứng với selectedGroupId
    const selectedGroup = datagroups.find((group) => group._id === selectedGroupId);
    // Cập nhật selectedDataGroup với id và name tương ứng
    setSelectedDataGroup({ id: selectedGroup._id, name: selectedGroup.name });
    // Gọi hàm fetchDataSet để lấy dữ liệu tương ứng với nhóm mới được chọn
    fetchDataSet(selectedGroup._id);
  };

  return (
    <div className="max-w-[1000px] mx-auto my-16 min-h-[800px]">
      <Helmet>
        <title>{t("titlePage")}</title>
        <meta name="description" content="Trang chủ dự án TextSim" />
      </Helmet>
      <div className="p-8">
        <div className="flex items-center justify-center">
          <img src={logo} className="h-20 mr-6" alt="TextSim Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap md:text-5xl">TextSim</span>
        </div>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="text-left pr-4">
          <p className="text-gray-600">Chọn nhóm dữ liệu</p>
        </div>
        <select
          value={selectedDataGroup.id}
          onChange={handleDataGroupChange}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0"
        >
          {!selectedDataGroup.id && <option value={null}>--Chọn nhóm--</option>}
          {datagroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        {isChangeButtonVisible && (
          <button
            onClick={handleDataGroupChangeButton}
            className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Thay đổi
          </button>
        )}
        <button
          onClick={() => setIsPopUpAddGroup(true)}
          className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Thêm nhóm
        </button>
        <button
          onClick={() => setIsPopUpDelGroup(true)}
          className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Xoá nhóm
        </button>
      </div>
      {!selectedDataGroup?.id && (
        <p className="text-center text-gray-600 mt-4">Vui lòng chọn nhóm dữ liệu muốn hiển thị</p>
      )}
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
            <p className="text-gray-600">Nhập độ tương đồng:</p>
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
            onClick={handleAddData}
            className="px-4 py-2 mx-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Thêm dữ liệu
          </button>
          <button
            onClick={handleExportData}
            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            Xuất file dữ liệu
          </button>
        </div>
      )}
      {showTable && selectedDataGroup?.id && (
        <>
          <div className="table-container">
            <h2>Bảng dữ liệu các câu tương đồng</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="first-sentence-column">First Sentence</th>
                    <th className="second-sentence-column">Second Sentence</th>
                    <th className="score-column">Score</th>
                    <th className="task-header">Tác vụ</th>
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
                        <button className="action-button" onClick={() => handleUpdateClick(index)}>
                          Chỉnh sửa
                        </button>
                        <button className="action-button" onClick={() => handleDeleteClick(index)}>
                          Xóa
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
              <label className="block mb-2 text-gray-600">Tên Nhóm:</label>
              <input
                type="text"
                value={newGroupName}
                placeholder="Nhập tên nhóm..."
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>

            {/* Trường chọn ngôn ngữ */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Ngôn ngữ:</label>
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
              <label className="block mb-2 text-gray-600">Loại So Sánh:</label>
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
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {IsPopUpDelGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Xóa Nhóm Dữ Liệu</h2>
            <p className="mb-4 text-center">Bạn có chắc chắn muốn xóa nhóm dữ liệu này?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsPopUpDelGroup(false)}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {isPopUpEditData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Sửa Dữ Liệu</h2>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Câu 1</label>
              <input
                type="text"
                value={editFirstSentence}
                onChange={(e) => setEditFirstSentence(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Câu 2</label>
              <input
                type="text"
                value={editSecondSentence}
                onChange={(e) => setEditSecondSentence(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Điểm</label>
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
                Hủy
              </button>
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {isPopUpDelData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Xóa Dữ Liệu</h2>
            <p className="mb-4 text-center">Bạn có chắc chắn muốn xóa dữ liệu này không?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsPopUpDelData(false)}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddDataPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg">
            <h2 className={`mb-4 text-lg font-semibold ${errorMessage ? "text-red-600" : "text-green-600"}`}>
              {errorMessage ? errorMessage : "Thêm dữ liệu thành công"}
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
              Đóng
            </button>
          </div>
        </div>
      )}

      {showExportPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg">
            <h2 className={`mb-4 text-lg font-semibold ${errorMessage ? "text-red-600" : "text-green-600"}`}>
              {errorMessage ? errorMessage : "Xuất file thành công"}
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
              Đóng
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
