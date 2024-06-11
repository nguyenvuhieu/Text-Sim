import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/images/logo.png";
import { Helmet } from "react-helmet-async";
import "./Corpus.css";
import { useTranslation } from "react-i18next";

const HOST = "http://127.0.0.1:8000";

const Corpus = () => {
  const { t } = useTranslation("corpus");

  // States
  const [documentGroups, setDocumentGroups] = useState([]);
  const [selectedDocGroup, setSelectedDocGroup] = useState({});
  const [documents, setDocuments] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showTable, setShowTable] = useState(false); // State để kiểm soát hiển thị bảng

  // States for popups
  const [isPopUpAddGroup, setIsPopUpAddGroup] = useState(false);
  const [isPopUpEditGroup, setIsPopUpEditGroup] = useState(false);
  const [isPopUpDeleteGroup, setIsPopUpDeleteGroup] = useState(false);
  const [isPopUpAddDoc, setIsPopUpAddDoc] = useState(false);
  const [isPopUpEditDoc, setIsPopUpEditDoc] = useState(false);
  const [isPopUpDeleteDoc, setIsPopUpDeleteDoc] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showContentPopup, setShowContentPopup] = useState(false);
  const [popupDocument, setPopupDocument] = useState(null);
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const [inputArray, setInputArray] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadResultPopup, setShowUploadResultPopup] = useState(false);
  const [uploadResultMessage, setUploadResultMessage] = useState("");
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
    try {
      fetchDocumentGroups();
    } catch (error) {
      console.error("Error fetching document groups:", error);
      setSelectedDocGroup(null); // Đặt selectedDocGroup thành null khi có lỗi
      setErrorMessage(t("errorLoadingDocumentGroups"));
    }
  }, []);

  useEffect(() => {
    fetchDocuments(); // Gọi fetchDataSet ngay khi selectedDataGroup thay đổi
    setShowTable(true); // Luôn hiển thị bảng dữ liệu
  }, [selectedDocGroup]);

  // Fetch document groups
  const fetchDocumentGroups = async () => {
    try {
      const { data } = await api.get(`${HOST}/corpus`);
      setDocumentGroups(data.corpus);
    } catch (error) {
      console.error("Error fetching document groups:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      if (selectedDocGroup && selectedDocGroup.id) {
        // Check if selectedDocGroup is not null
        const response = await api.get(`${HOST}/corpus/${selectedDocGroup.id}/documents?skip=0&limit=1000`);
        if (response.data && response.data.documents) {
          setDocuments(response.data.documents);
          setShowTable(true); // Hiển thị bảng sau khi fetch
        } else {
          console.error("Invalid response data:", response.data);
          setErrorMessage(t("invalidResponseData"));
        }
      } else {
        setShowTable(false); // Ẩn bảng nếu không có nhóm nào được chọn
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Handle document group change
  const handleDocGroupChange = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedGroup = {
      id: e.target.value,
      name: e.target.options[selectedIndex].text
    };
    setSelectedDocGroup(selectedGroup);
  };

  // Popup handlers
  const handleOpenAddPopup = () => setIsPopUpAddGroup(true);
  const handleCloseAddPopup = () => {
    setIsPopUpAddGroup(false);
    setNewGroupName("");
    setErrorMessage("");
  };

  const handleCloseEditPopup = () => {
    setEditIndex(-1);
    setEditTitle("");
    setIsPopUpEditGroup(false);
    setErrorMessage("");
  };

  const handleOpenDeletePopup = (index) => {
    setEditIndex(index);
    setIsPopUpDeleteGroup(true);
  };

  const handleCloseDeletePopup = () => {
    setEditIndex(-1);
    setIsPopUpDeleteGroup(false);
  };
  // PopUpDochandlers

  const handleCloseAddPopUpDoc = () => {
    setSelectedFiles([]);
    setIsPopUpAddDoc(false);
    setNewTitle("");
    setNewContent("");
    setErrorMessage("");
    setShowUploadInterface(false);
  };

  const handleOpenEditPopUpDoc = (index) => {
    setEditIndex(index);
    setEditTitle(documents[index].title);
    setEditContent(formatCorpusText(documents[index].text));
    setIsPopUpEditDoc(true);
  };

  const handleCloseEditPopUpDoc = () => {
    setEditIndex(-1);
    setEditTitle("");
    setEditContent("");
    setIsPopUpEditDoc(false);
    setErrorMessage("");
  };

  const handleOpenDeletePopUpDoc = (index) => {
    setEditIndex(index);
    setIsPopUpDeleteDoc(true);
  };

  const handleCloseDeletePopUpDoc = () => {
    setEditIndex(-1);
    setIsPopUpDeleteDoc(false);
  };

  // Hàm mở popup hiển thị nội dung
  const handleOpenContentPopup = (document) => {
    setPopupDocument(document);
    setShowContentPopup(true);
  };

  // Hàm đóng popup hiển thị nội dung
  const handleCloseContentPopup = () => {
    setShowContentPopup(false);
    setPopupDocument(null);
  };

  // ... (các hàm API) ...

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      setErrorMessage(t("enterGroupName"));
      return;
    }

    try {
      const newGroup = {
        name: newGroupName
      };

      await api.post(`${HOST}/corpus`, newGroup);
      fetchDocumentGroups(); // Refresh danh sách nhóm tài liệu
      handleCloseAddPopup();
    } catch (error) {
      console.error("Error creating new group:", error);
      setErrorMessage(t("errorCreatingNewGroup") + error.response.data.detail);
    }
  };

  // Edit group
  const handleEditGroup = async () => {
    if (!editTitle) {
      setErrorMessage("Vui lòng nhập tên nhóm.");
      return;
    }

    try {
      const updatedGroup = {
        name: editTitle
      };

      await api.put(`${HOST}/corpus/${documentGroups[editIndex]._id}`, updatedGroup);
      fetchDocumentGroups(); // Refresh danh sách nhóm tài liệu
      handleCloseEditPopup();
    } catch (error) {
      console.error("Error updating group:", error);
      setErrorMessage(t("errorUpdatingGroup") + error.response.data.detail);
    }
  };

  // Delete group
  const handleDeleteGroup = async () => {
    try {
      await api.delete(`${HOST}/corpus/${documentGroups[editIndex]._id}`);
      fetchDocumentGroups(); // Refresh danh sách nhóm tài liệu
      handleCloseDeletePopup();
    } catch (error) {
      console.error("Error deleting group:", error);
      setErrorMessage(t("errorDeletingGroup") + error.response.data.detail);
    }
  };

  const handleAddDocument = async () => {
    try {
      let addedDocuments = [];
      let failedDocuments = [];
      if (showUploadInterface && inputArray.length > 0) {
        for (const file of inputArray) {
          const newDocument = {
            corpus_id: selectedDocGroup.id,
            title: file.name,
            content: file.data
          };

          try {
            await api.post(`${HOST}/corpus/document`, newDocument);
            addedDocuments.push(file.name); // Thêm tên file vào mảng nếu thành công
          } catch (err) {
            failedDocuments.push(file.name); // Thêm tên file vào mảng nếu thất bại
          }
        }
        setInputArray([]);
      } else if (!showUploadInterface) {
        // Xử lý trường hợp nhập thủ công
        if (!newTitle || !newContent) {
          setErrorMessage(t("enterFullInformation"));
          return;
        }
        const newDocument = {
          corpus_id: selectedDocGroup.id,
          title: newTitle,
          content: newContent
        };
        await api.post(`${HOST}/corpus/document`, newDocument);
      } else {
        setErrorMessage(t("noFilesSelected"));
        return;
      }

      fetchDocuments();
      setShowUploadInterface(false);
      handleCloseAddPopUpDoc();

      // Hiển thị popup thông báo kết quả
      if (addedDocuments.length > 0 || failedDocuments.length > 0) {
        setShowUploadResultPopup(true);
        setUploadResultMessage(
          <div>
            {addedDocuments.length > 0 && (
              <>
                <p>{t("addDocumentSuccess")}</p>
                <ul>
                  {addedDocuments.map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              </>
            )}
            {failedDocuments.length > 0 && (
              <>
                <p>{t("addDocumentFail")}</p>
                <ul>
                  {failedDocuments.map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );
      }
    } catch (error) {
      console.error("Error adding document:", error);
      setErrorMessage(error.message);
    }
  };

  const handleUpdateDocument = async () => {
    try {
      // Kiểm tra các trường editTitle và editContent
      if (!editTitle || !editContent) {
        setErrorMessage("Vui lòng điền đầy đủ thông tin.");
        return;
      }

      const updatedDocument = {
        corpus_id: selectedDocGroup.id,
        title: editTitle,
        content: editContent
      };

      await api.put(`${HOST}/corpus/document/${documents[editIndex]._id}`, updatedDocument);
      fetchDocuments();
      handleCloseEditPopUpDoc(); // Đóng popup sau khi cập nhật thành công
    } catch (error) {
      console.error("Error updating document:", error);
      setErrorMessage(error.message); // Hiển thị thông báo lỗi
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await api.delete(`${HOST}/corpus/document/${documents[editIndex]._id}`);
      fetchDocuments();
      handleCloseDeletePopUpDoc(); // Đóng popup sau khi xóa thành công
    } catch (error) {
      console.error("Error deleting document:", error);
      setErrorMessage(error.message); // Hiển thị thông báo lỗi
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get(`${HOST}/corpus/${selectedDocGroup.id}/documents`);
      const documents = response.data.documents;

      // Tạo tiêu đề cho file CSV với encoding UTF-8
      const csvHeader = "\uFEFFTitle,Content\n";
      // Tạo nội dung cho file CSV từ dữ liệu documents
      let csvContent = "";

      documents.forEach((doc) => {
        const { title } = doc;
        const content = formatCorpusText(doc.text);
        // Bao quanh giá trị của mỗi trường trong dấu ngoặc kép và sử dụng dấu phẩy làm phân tách
        csvContent += `"${title.replace(/"/g, '""')}","${content.replace(/"/g, '""')}"\n`;
      });
      // Tạo nội dung hoàn chỉnh của file CSV bằng cách kết hợp tiêu đề và nội dung
      const csv = csvHeader + csvContent;

      // Tạo blob từ chuỗi CSV với encoding UTF-8
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

      // Tạo URL từ blob để người dùng có thể tải xuống
      const url = window.URL.createObjectURL(blob);

      // Tạo phần tử <a> ẩn để tải xuống tệp CSV
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedDocGroup.name}-corpus.csv`);
      document.body.appendChild(link);

      // Kích hoạt sự kiện nhấp chuột trên phần tử <a> để bắt đầu quá trình tải xuống
      link.click();

      // Loại bỏ phần tử <a> sau khi tải xuống hoàn tất
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  function formatCorpusText(text, maxSentences = null) {
    let output = [];
    let currentParagraphIndex = 0;

    for (let index = 0; index < text.sentences.length; index++) {
      if (text.paragraph_index[currentParagraphIndex] && !text.paragraph_index[currentParagraphIndex].includes(index)) {
        output.push("\n\n");
        currentParagraphIndex++;
      }

      output.push(text.sentences[index]);

      // Nếu maxSentences được chỉ định và đã đạt đến giới hạn, dừng lại
      if (maxSentences && output.length >= maxSentences) {
        break;
      }
    }

    return output.join(" ");
  }

  // Hàm xử lý khi checkbox thay đổi
  const handleCheckboxChange = (event) => {
    setShowUploadInterface(event.target.checked); // Cập nhật state
  };

  // Hàm xử lý khi người dùng chọn tệp
  const handleFileChange = async (event) => {
    try {
      const files = Array.from(event.target.files);
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post(`${HOST}/utility/files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data" // Đặt header Content-Type
        }
      });

      if (response.status !== 200) {
        // Xử lý lỗi nếu cần
        throw new Error(t("networkResponseNotOk"));
      }

      const data = response.data; // Lấy dữ liệu từ response
      const newFiles = data.files.map((file) => ({
        name: file.file_name,
        data: file.raw // Hoặc sử dụng các thuộc tính khác
      }));

      setSelectedFiles(newFiles);
      setInputArray(newFiles);
    } catch (error) {
      console.error("Error:", error);
      // Xử lý lỗi khác nếu cần
    }
  };

  // Hàm xử lý xóa file khỏi danh sách đã chọn
  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  return (
    <div className="max-w-[1000px] mx-auto my-16 min-h-[800px] overflow-hidden">
      <Helmet>
        <title>{t("titlePage")}</title>
      </Helmet>

      <div className="p-8">
        <div className="flex items-center justify-center">
          <img src={logo} className="h-20 mr-6" alt="TextSim Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap md:text-5xl">TextSim</span>
        </div>
      </div>

      {/* Chọn Nhóm Tài Liệu */}
      <div className="flex items-center justify-center mb-4">
        <div className="text-left pr-4">
          <p className="text-gray-600">{t("selectDocumentGroup")}</p>
        </div>

        <select
          value={selectedDocGroup.id}
          onChange={handleDocGroupChange}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0"
        >
          {!selectedDocGroup.id && <option value={null}>{t("selectGroup")}</option>}
          {documentGroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        {/* Nút Thêm Nhóm Tài Liệu */}
        <button
          class="rounded-lg relative w-36 h-10 cursor-pointer flex items-center border border-blue-500 bg-blue-500 group hover:bg-blue-500 active:bg-blue-500 active:border-blue-500 mr-4 ml-6"
          onClick={handleOpenAddPopup}
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

        {/* Nút Xóa Nhóm Tài Liệu (chỉ hiển thị khi có nhóm được chọn) */}
        {selectedDocGroup?.id && ( // Kiểm tra selectedDocGroup.id trước khi truy cập
          <button
            class="delete-group"
            type="button"
            onClick={() =>
              handleOpenDeletePopup(documentGroups.findIndex((group) => group._id === selectedDocGroup.id))
            }
          >
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

        {/* Nút Thêm Tài Liệu (chỉ hiển thị khi có nhóm được chọn) */}
        {selectedDocGroup?.id && ( // Kiểm tra selectedDocGroup.id trước khi truy cập
          <button
            class="rounded-lg relative w-40 h-10 cursor-pointer flex items-center border border-green-500 bg-green-500 group hover:bg-green-500 active:bg-green-500 active:border-green-500 ml-4 mr-4"
            onClick={() => setIsPopUpAddDoc(true)}
          >
            <span class="text-white font-semibold ml-1 transform group-hover:translate-x-5 transition-all duration-300">
              {t("addDocument")}
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
        )}

        {/* Nút Xuất File Dữ Liệu */}
        {selectedDocGroup?.id && (
          <div
            className="download-button"
            data-tooltip={t("numberOfDocuments", { count: documents.length })}
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
        )}
      </div>

      {!selectedDocGroup?.id && <p className="text-center text-gray-600 mt-4">{t("selectCorpusToDisplay")}</p>}
      {showTable && selectedDocGroup?.id && (
        <div>
          <h2>{t("documentList")}</h2>
          <div className="table-container  ">
            <table className="data-table ">
              <thead>
                <tr>
                  <th className="title-column">{t("title")}</th>
                  <th className="content-column">{t("content")}</th>
                  <th className="task-header">{t("task")}</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document, index) => {
                  return (
                    <tr key={index}>
                      <td>{document.title}</td>
                      <td className="content-cell">
                        <div className="content-scroll">
                          {document.text.sentences.length < 6 ? (
                            <p>{formatCorpusText(document.text)}</p>
                          ) : (
                            <>
                              <p>{formatCorpusText(document.text, 5)}...</p>
                              {document.text.sentences.length > 5 && (
                                <button className="toggle-button" onClick={() => handleOpenContentPopup(document)}>
                                  {t("viewMore")}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="task-buttons">
                        <button class="edit-button" onClick={() => handleOpenEditPopUpDoc(index)}>
                          {t("edit")}
                          <svg class="svg" viewBox="0 0 512 512">
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                          </svg>
                        </button>

                        <button class="bin-button" onClick={() => handleOpenDeletePopUpDoc(index)}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popup thêm nhóm tài liệu */}
      {isPopUpAddGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("addGroupDocument")}</h2>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Tên Nhóm:</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            <div className="flex justify-end">
              <button
                onClick={handleCloseAddPopup}
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

      {/* Popup sửa nhóm tài liệu */}
      {isPopUpEditGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("editGroupDocument")}</h2>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Tên Nhóm:</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            <div className="flex justify-end">
              <button
                onClick={handleCloseEditPopup}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleEditGroup}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xóa nhóm tài liệu */}
      {isPopUpDeleteGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("deleteGroupDocument")}</h2>
            <p className="mb-4 text-center">{t("confirmDeleteGroupDocument")}</p>
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            <div className="flex justify-end">
              <button
                onClick={handleCloseDeletePopup}
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

      {/* Popup thêm tài liệu */}
      {isPopUpAddDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("addNewDocument")}</h2>

            {/* Checkbox */}
            <div className="mb-4">
              <input type="checkbox" id="uploadCheckbox" onChange={handleCheckboxChange} />
              <label htmlFor="uploadCheckbox" className="ml-2">
                {t("uploadFileFromDevice")}
              </label>
            </div>

            {/* Input tiêu đề và nội dung (chỉ hiển thị khi checkbox không được chọn) */}
            {!showUploadInterface && (
              <>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-600">{t("title")}</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-600">{t("content")}:</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0 h-48"
                  ></textarea>
                </div>
              </>
            )}

            {/* Giao diện tải lên tệp (chỉ hiển thị khi checkbox được chọn) */}
            {showUploadInterface && (
              <div className="flex flex-col justify-center w-4/5 ml-4">
                <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                  />
                  <div>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-4 bg-gray-100">
                        <span>{file.name}</span>
                        <button
                          className="text-blue-500 underline hover:text-red-500"
                          onClick={() => handleRemoveFile(index)}
                        >
                          {t("delete")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            <div className="flex items-center space-x-4">
              {/* Nút Hủy */}
              <button
                onClick={handleCloseAddPopUpDoc}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 "
              >
                {t("cancel")}
              </button>

              {/* Nút Thêm (chỉ hiển thị khi không chọn upload file) */}
              {!showUploadInterface && (
                <button
                  onClick={handleAddDocument}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  {t("add")}
                </button>
              )}

              {/* Nút thêm từ file (chỉ hiển thị khi checkbox được chọn và có tệp được chọn) */}
              {showUploadInterface && selectedFiles.length > 0 && (
                <button onClick={handleAddDocument} className="add-file-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
                      stroke="#fffffff"
                      stroke-width="2"
                    ></path>
                    <path
                      d="M17 15V18M17 21V18M17 18H14M17 18H20"
                      stroke="#fffffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                  {t("addFile")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Popup sửa tài liệu */}
      {isPopUpEditDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("editDocument")}</h2>
            {/* Input tiêu đề */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("title")}</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            {/* Input nội dung */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">{t("content")}:</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0 h-48"
              ></textarea>
            </div>
            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {/* Nút Hủy và Lưu */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseEditPopUpDoc}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleUpdateDocument}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup xóa tài liệu */}
      {isPopUpDeleteDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("deleteDocument")}</h2>
            <p className="mb-4 text-center">{t("confirmDeleteDocument")}</p>
            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {/* Nút Hủy và Xóa */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseDeletePopUpDoc}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteDocument}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup hiển thị nội dung */}
      {showContentPopup && popupDocument && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">
              {t("documentContent")} {popupDocument.title}
            </h2>
            {/* Ô chứa nội dung (danh sách câu) có thanh cuộn */}
            <div className="popup-text-container mb-4">
              <div className="popup-text">
                {popupDocument.text.sentences.map((sentence, sentenceIndex) => (
                  <p key={sentenceIndex}>{sentence}</p>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseContentPopup}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup kết quả tải lên */}
      {showUploadResultPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">{t("uploadResult")}</h2>
            {/* Render uploadResultMessage như một phần tử React */}
            {uploadResultMessage}
            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadResultPopup(false)}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Overlay và spinner */}
      {loading && (
        <div className="loading-overlay">
          <div class="dot-spinner">
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
            <div class="dot-spinner__dot"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Corpus;
