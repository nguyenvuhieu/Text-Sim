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
  const [showFullContent, setShowFullContent] = useState(false);
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
      setErrorMessage("Lỗi khi tải danh sách nhóm tài liệu.");
    }
  }, []);

  useEffect(() => {
    fetchDocuments(); // Gọi fetchDataSet ngay khi selectedDataGroup thay đổi
    setShowTable(true); // Luôn hiển thị bảng dữ liệu
  }, [selectedDocGroup]);

  // Fetch document groups
  const fetchDocumentGroups = async () => {
    try {
      const { data } = await api.get("http://127.0.0.1:8000/corpus");
      setDocumentGroups(data.corpus);
    } catch (error) {
      console.error("Error fetching document groups:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      if (selectedDocGroup && selectedDocGroup.id) {
        // Check if selectedDocGroup is not null
        const response = await api.get(`${HOST}/corpus/${selectedDocGroup.id}/documents?skip=0&limit=10`);
        if (response.data && response.data.documents) {
          setDocuments(response.data.documents);
          setShowTable(true); // Hiển thị bảng sau khi fetch
        } else {
          console.error("Invalid response data:", response.data);
          setErrorMessage("Dữ liệu phản hồi không hợp lệ.");
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
    setShowTable(false); // Ẩn bảng khi thay đổi nhóm
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
      setErrorMessage("Vui lòng nhập tên nhóm.");
      return;
    }

    try {
      const newGroup = {
        name: newGroupName
      };

      await api.post(`${HOST}/corpus", newGroup`);
      fetchDocumentGroups(); // Refresh danh sách nhóm tài liệu
      handleCloseAddPopup();
    } catch (error) {
      console.error("Error creating new group:", error);
      setErrorMessage("Lỗi khi tạo nhóm mới: " + error.response.data.detail);
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
      setErrorMessage("Lỗi khi cập nhật nhóm: " + error.response.data.detail);
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
      setErrorMessage("Lỗi khi xóa nhóm: " + error.response.data.detail);
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
          setErrorMessage("Vui lòng điền đầy đủ thông tin.");
          return;
        }
        const newDocument = {
          corpus_id: selectedDocGroup.id,
          title: newTitle,
          content: newContent
        };
        await api.post(`${HOST}/corpus/document`, newDocument);
      } else {
        setErrorMessage("Chưa có tệp nào được chọn.");
        return;
      }

      fetchDocuments();
      setShowUploadInterface(false);
      handleCloseAddPopUpDoc();

      // Hiển thị popup thông báo kết quả
      if (addedDocuments.length > 0 || failedDocuments.length > 0) {
        setShowUploadResultPopup(true);
        setUploadResultMessage(
          <div
            dangerouslySetInnerHTML={{
              __html:
                (addedDocuments.length > 0
                  ? "Thêm thành công các tài liệu:<br />" + addedDocuments.map((name) => `• ${name}`).join("<br />")
                  : "") +
                (failedDocuments.length > 0
                  ? "<br />Thêm thất bại các tài liệu:<br />" +
                    failedDocuments.map((name) => `• ${name}`).join("<br />")
                  : "")
            }}
          />
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

  // Hàm xử lý khi người dùng chọn tệp (di chuyển ra ngoài)
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    fetch(`${HOST}/utility/files`, {
      method: "POST",
      body: formData
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Tạo mảng mới chứa các object có cấu trúc tương tự dữ liệu từ server
        const newFiles = data.files.map((file) => ({
          name: file.file_name,
          data: file.raw // Ở đây bạn có thể sử dụng raw data hoặc các thuộc tính khác tùy thuộc vào yêu cầu của bạn
        }));

        // Cập nhật state selectedFiles với mảng mới đã tạo
        setSelectedFiles(newFiles);
        setInputArray(newFiles);
        alert(JSON.stringify(inputArray));
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error uploading files");
      });
  };

  // Hàm xử lý xóa file khỏi danh sách đã chọn
  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };
  // Hàm xử lý việc thêm tài liệu từ các tệp đã chọn
  const handleAddDocumentsFromFiles = async () => {};
  return (
    <div className="max-w-[1000px] mx-auto my-16 min-h-[800px]">
      <Helmet>
        <title>{t("titlePage")}</title>
        <meta name="description" content="Trang quản lý Corpus" />
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
          <p className="text-gray-600">Chọn nhóm tài liệu:</p>
        </div>

        <select
          value={selectedDocGroup.id}
          onChange={handleDocGroupChange}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0"
        >
          {!selectedDocGroup.id && <option value={null}>--Chọn nhóm--</option>}
          {documentGroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
        {/* Nút Thêm Nhóm Tài Liệu */}
        <button
          onClick={handleOpenAddPopup}
          className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Thêm Nhóm
        </button>

        {/* Nút Xóa Nhóm Tài Liệu (chỉ hiển thị khi có nhóm được chọn) */}
        {selectedDocGroup?.id && ( // Kiểm tra selectedDocGroup.id trước khi truy cập
          <button
            onClick={() =>
              handleOpenDeletePopup(documentGroups.findIndex((group) => group._id === selectedDocGroup.id))
            }
            className="px-4 py-2 ml-4 text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Xóa Nhóm
          </button>
        )}

        {/* Nút Thêm Tài Liệu (chỉ hiển thị khi có nhóm được chọn) */}
        {selectedDocGroup?.id && ( // Kiểm tra selectedDocGroup.id trước khi truy cập
          <button
            onClick={() => setIsPopUpAddDoc(true)}
            className="px-4 py-2 ml-4 text-white bg-green-500 rounded-lg hover:bg-green-600"
          >
            Thêm Tài Liệu
          </button>
        )}

        {/* Nút Xuất File Dữ Liệu */}
        <button
          onClick={handleExportData}
          className="px-4 py-2 ml-4 text-white bg-purple-500 rounded-lg hover:bg-purple-600"
        >
          Xuất file dữ liệu{" "}
        </button>
      </div>

      {!selectedDocGroup?.id && (
        <p className="text-center text-gray-600 mt-4">Vui lòng chọn nhóm ngữ liệu muốn hiển thị</p>
      )}
      {showTable && selectedDocGroup?.id && (
        <div>
          <h2>Danh Sách Tài Liệu:</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="title-column">Tiêu đề</th>
                  <th className="content-column">Nội dung</th>
                  <th className="task-header">Tác vụ</th>
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
                                  Xem thêm
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="task-buttons">
                        <button className="action-button" onClick={() => handleOpenEditPopUpDoc(index)}>
                          Chỉnh sửa
                        </button>
                        <button className="action-button" onClick={() => handleOpenDeletePopUpDoc(index)}>
                          Xóa
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
            <h2 className="mb-4 text-2xl font-semibold text-center">Thêm Nhóm Tài Liệu</h2>
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

      {/* Popup sửa nhóm tài liệu */}
      {isPopUpEditGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Chỉnh Sửa Nhóm Tài Liệu</h2>
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
                Hủy
              </button>
              <button
                onClick={handleEditGroup}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xóa nhóm tài liệu */}
      {isPopUpDeleteGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Xóa Nhóm Tài Liệu</h2>
            <p className="mb-4 text-center">Bạn có chắc chắn muốn xóa nhóm tài liệu này?</p>
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            <div className="flex justify-end">
              <button
                onClick={handleCloseDeletePopup}
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

      {/* Popup thêm tài liệu */}
      {isPopUpAddDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Thêm Tài Liệu Mới</h2>

            {/* Checkbox */}
            <div className="mb-4">
              <input type="checkbox" id="uploadCheckbox" onChange={handleCheckboxChange} />
              <label htmlFor="uploadCheckbox" className="ml-2">
                Tải file từ máy
              </label>
            </div>

            {/* Input tiêu đề và nội dung (chỉ hiển thị khi checkbox không được chọn) */}
            {!showUploadInterface && (
              <>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-600">Tiêu đề:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-600">Nội dung:</label>
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
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}

            {/* Nút Hủy */}
            <button
              onClick={handleCloseAddPopUpDoc}
              className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>

            {/* Nút Thêm (chỉ hiển thị khi không chọn upload file) */}
            {!showUploadInterface && (
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Thêm
              </button>
            )}

            {/* Nút thêm từ file (chỉ hiển thị khi checkbox được chọn và có tệp được chọn) */}
            {showUploadInterface && selectedFiles.length > 0 && (
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Thêm File
              </button>
            )}
          </div>
        </div>
      )}
      {/* Popup sửa tài liệu */}
      {isPopUpEditDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Chỉnh Sửa Tài Liệu</h2>
            {/* Input tiêu đề */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Tiêu đề:</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            {/* Input nội dung */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Nội dung:</label>
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
                Hủy
              </button>
              <button
                onClick={handleUpdateDocument}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup xóa tài liệu */}
      {isPopUpDeleteDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Xóa Tài Liệu</h2>
            <p className="mb-4 text-center">Bạn có chắc chắn muốn xóa tài liệu này?</p>
            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {/* Nút Hủy và Xóa */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseDeletePopUpDoc}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteDocument}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup hiển thị nội dung */}
      {showContentPopup && popupDocument && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Nội dung tài liệu: {popupDocument.title}</h2>
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup kết quả tải lên */}
      {showUploadResultPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-md p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Kết Quả Tải Lên</h2>
            {/* Render uploadResultMessage như một phần tử React */}
            {uploadResultMessage}
            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadResultPopup(false)}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Đóng
              </button>
            </div>
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

export default Corpus;
