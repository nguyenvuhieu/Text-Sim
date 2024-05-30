import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/images/logo.png";
import { Helmet } from "react-helmet-async";
import "./Corpus.css";
import { useTranslation } from "react-i18next";

const MAXIMUM_NUMBER_OF_CHARACTERS = 1000;

const Corpus = () => {
  const { t } = useTranslation("corpus");

  // States
  const [documentGroups, setDocumentGroups] = useState([]);
  const [selectedDocGroup, setSelectedDocGroup] = useState(null);
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

  useEffect(() => {
    fetchDocumentGroups();
  }, []);

  // Fetch document groups
  const fetchDocumentGroups = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/corpus");
      setDocumentGroups(data.corpus);
    } catch (error) {
      console.error("Error fetching document groups:", error);
    }
  };

  // Fetch documents within the selected group
  const fetchDocuments = async () => {
    try {
      if (selectedDocGroup) {
        const response = await axios.get(
          `http://127.0.0.1:8000/corpus/${selectedDocGroup.id}/documents?skip=0&limit=10`
        );
        setDocuments(response.data.documents);
        setShowTable(true); // Hiển thị bảng sau khi fetch
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

  const handleOpenEditPopup = (index) => {
    setEditIndex(index);
    setEditTitle(documentGroups[index].name); // Giả sử documentGroups có trường name
    setIsPopUpEditGroup(true);
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
  const handleOpenAddPopUpDoc = () => setIsPopUpAddDoc(true);
  const handleCloseAddPopUpDoc = () => {
    setIsPopUpAddDoc(false);
    setNewTitle("");
    setNewContent("");
    setErrorMessage("");
  };

  const handleOpenEditPopUpDoc = (index) => {
    setEditIndex(index);
    setEditTitle(documents[index].title);
    setEditContent(documents[index].content);
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

      await axios.post("http://127.0.0.1:8000/corpus", newGroup);
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

      await axios.put(`http://127.0.0.1:8000/corpus/${documentGroups[editIndex]._id}`, updatedGroup);
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
      await axios.delete(`http://127.0.0.1:8000/corpus/${documentGroups[editIndex]._id}`);
      fetchDocumentGroups(); // Refresh danh sách nhóm tài liệu
      handleCloseDeletePopup();
    } catch (error) {
      console.error("Error deleting group:", error);
      setErrorMessage("Lỗi khi xóa nhóm: " + error.response.data.detail);
    }
  };

  const handleAddDocument = async () => {
    try {
      // Kiểm tra các trường newTitle và newContent
      if (!newTitle || !newContent) {
        setErrorMessage("Vui lòng điền đầy đủ thông tin.");
        return;
      }

      const newDocument = {
        corpus_id: selectedDocGroup.id,
        title: newTitle,
        content: newContent
      };

      await axios.post("http://127.0.0.1:8000/corpus/document", newDocument);

      fetchDocuments();
      handleCloseAddPopUpDoc(); // Đóng popup sau khi thêm thành công
    } catch (error) {
      console.error("Error adding document:", error);
      setErrorMessage(error.message); // Hiển thị thông báo lỗi
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

      await axios.put(`http://127.0.0.1:8000/corpus/document/${documents[editIndex]._id}`, updatedDocument);
      fetchDocuments();
      handleCloseEditPopUpDoc(); // Đóng popup sau khi cập nhật thành công
    } catch (error) {
      console.error("Error updating document:", error);
      setErrorMessage(error.message); // Hiển thị thông báo lỗi
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/corpus/document/${documents[editIndex]._id}`);
      fetchDocuments();
      handleCloseDeletePopUpDoc(); // Đóng popup sau khi xóa thành công
    } catch (error) {
      console.error("Error deleting document:", error);
      setErrorMessage(error.message); // Hiển thị thông báo lỗi
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/corpus/${selectedDocGroup.id}/documents`);
      const documents = response.data.documents;

      // Tạo tiêu đề cho file CSV với encoding UTF-8
      const csvHeader = "\uFEFFTitle,Content\n";
      // Tạo nội dung cho file CSV từ dữ liệu documents
      let csvContent = "";

      documents.forEach((doc) => {
        const { title, content } = doc;
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

  return (
    <div className="max-w-[1200px] mx-auto my-16 min-h-[800px]">
      <Helmet>
        <title>{t("titlePage")}</title>
        <meta name="description" content="Trang quản lý tài liệu" />
      </Helmet>
      <div className="p-8">
        <div className="flex items-center justify-center">
          <img src={logo} className="h-20 mr-6" alt="TextSim Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap md:text-5xl">TextSim</span>
        </div>
      </div>

      {/* Dropdown chọn nhóm tài liệu */}
      <div className="flex items-center justify-center mb-4">
        <div className="text-left pr-4">
          <p className="text-gray-600">Chọn nhóm tài liệu:</p>
        </div>
        <select
          value={selectedDocGroup ? selectedDocGroup.id : ""}
          onChange={handleDocGroupChange}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0"
        >
          <option value="">-- Chọn nhóm --</option>
          {documentGroups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Nút Thêm nhóm, Xóa nhóm, Sửa nhóm */}
        <button
          onClick={handleOpenAddPopup}
          className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Thêm nhóm
        </button>
        {selectedDocGroup && (
          <>
            <button
              onClick={() =>
                handleOpenEditPopup(documentGroups.findIndex((group) => group._id === selectedDocGroup.id))
              }
              className="px-4 py-2 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Sửa nhóm
            </button>
            <button
              onClick={() =>
                handleOpenDeletePopup(documentGroups.findIndex((group) => group._id === selectedDocGroup.id))
              }
              className="px-4 py-2 ml-4 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Xóa nhóm
            </button>
          </>
        )}
      </div>
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={fetchDocuments} // Gọi hàm để lấy dữ liệu và hiển thị bảng
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Hiển thị kho ngữ liệu
        </button>
      </div>
      {/* Hiển thị bảng chỉ khi showTable là true và đã chọn nhóm tài liệu */}
      {showTable && selectedDocGroup && (
        <>
          {/* Bảng danh sách tài liệu */}
          <div className="table-container">
            <h2>Danh sách tài liệu nhóm {selectedDocGroup?.name}</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="title-column w-1/6">Tiêu đề</th>
                    <th className="content-column w-4/6">Nội dung</th>
                    <th className="task-header w-1/6">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={index} className={editIndex === index ? "editing-row" : ""}>
                      <td>
                        {editIndex === index ? (
                          <input
                            className="input-field"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        ) : (
                          doc.title
                        )}
                      </td>
                      <td>
                        {editIndex === index ? (
                          <textarea
                            className="input-field"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          ></textarea>
                        ) : (
                          doc.content
                        )}
                      </td>
                      <td className="task-buttons">
                        {editIndex === index ? (
                          <>
                            <button className="action-button" onClick={() => handleUpdateDocument(index)}>
                              Lưu
                            </button>
                            <button className="action-button" onClick={() => setEditIndex(-1)}>
                              Hủy
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="action-button" onClick={() => handleOpenEditPopUpDoc(index)}>
                              Cập nhật
                            </button>
                            <button className="action-button" onClick={() => handleOpenDeletePopUpDoc(index)}>
                              Xóa
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
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

      {isPopUpAddDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white rounded-lg">
            <h2 className="mb-4 text-2xl font-semibold text-center">Thêm Tài Liệu Mới</h2>
            {/* Input tiêu đề */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Tiêu đề:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0"
              />
            </div>
            {/* Input nội dung */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Nội dung:</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg focus:ring-0 h-48"
              ></textarea>
            </div>
            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && <div className="mb-3 text-red-500">{errorMessage}</div>}
            {/* Nút Hủy và Thêm */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseAddPopUpDoc}
                className="px-4 py-2 mr-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Thêm
              </button>
            </div>
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
    </div>
  );
};

export default Corpus;
