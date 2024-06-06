import axios from "axios";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo.png";
import { Helmet } from "react-helmet-async";
import colorMap from "../../constants/colorMap";
import { arc } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { format } from "d3-format";
import "./style.css";
import "./spin.css";
import "../Corpus/Corpus";
//import handleClick from "./onclick";

const MAXIMUM_NUMBER_OF_CHARACTERS = 10000;
const MODEL_VIE = "paraphrase-multilingual-mpnet-base-v2";
const MODEL_ENG = "all-MiniLM-L6-v2";
const HOST = "http://127.0.0.1:8000";

const Product = () => {
  const { t } = useTranslation("product");

  const [data, setData] = useState("");
  const [data_v2, setData_v2] = useState("");
  const [data_v3, setData_v3] = useState("");
  const [inputs1, setInputs1] = useState("");
  const [inputs2, setInputs2] = useState("");
  const [inputs3, setInputs3] = useState("");
  const [inputs4, setInputs4] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [numberOfCharacters1, setNumberOfCharacters1] = useState(0);
  const [numberOfCharacters2, setNumberOfCharacters2] = useState(0);
  const [numberOfCharacters3, setNumberOfCharacters3] = useState(0);
  const [numberOfCharacters4, setNumberOfCharacters4] = useState(0);
  const [language, setLanguage] = useState("Tiếng Việt");
  const [mode, setMode] = useState("1");
  const [clickv1, setClickv1] = useState(false);
  const [clickbutton, setClickbutton] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // Thêm state để lưu trữ dữ liệu của file được chọn
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [selectedIdx_v3, setSelectedIdx_v3] = useState(null);
  const [scorev1, setScorev1] = useState(0);
  const [colorv1, setColorv1] = useState("");
  const [inputArray, setInputArray] = useState([]);
  const [pairsByFirst, setPairsByFirst] = useState([]);
  const [pairsByFirst_v3, setPairsByFirst_v3] = useState([]);
  const [modelActivated, setModelActivated] = useState(false);
  const [corpusList, setCorpusList] = useState([]);
  const [selectedCorpusId, setSelectedCorpusId] = useState("");
  const [inputType1, setInputType1] = useState("text");
  const [inputType2, setInputType2] = useState("text");
  const [inputType3, setInputType3] = useState("text");
  const [inputType4, setInputType4] = useState("text");
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [file4, setFile4] = useState(null);
  const [selectedFileName1, setSelectedFileName1] = useState(null); // Tên tệp của input 1
  const [selectedFileName2, setSelectedFileName2] = useState(null); // Tên tệp của input 2
  const [selectedFileName3, setSelectedFileName3] = useState(null);
  const [selectedFileName4, setSelectedFileName4] = useState(null);

  const Gauge = (value, min, max, label, color) => {
    const backgroundArc = arc()
      .innerRadius(0.65)
      .outerRadius(1)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
      .cornerRadius(1)();

    const percentScale = scaleLinear().domain([min, max]).range([0, 1]);
    const percent = percentScale(value);

    const angleScale = scaleLinear()
      .domain([0, 1])
      .range([-Math.PI / 2, Math.PI / 2])
      .clamp(true);

    const angle = angleScale(percent);

    const filledArc = arc()
      .innerRadius(0.65)
      .outerRadius(1)
      .startAngle(-Math.PI / 2)
      .endAngle(angle)
      .cornerRadius(1)();

    const colorScale = scaleLinear().domain([0, 1]).range(["#dbe7db", color]);

    const gradientSteps = colorScale.ticks(20).map((value) => colorScale(value));

    const markerLocation = getCoordsOnArc(angle, 1 - (1 - 0.65) / 2);

    return (
      <div
        style={{
          textAlign: "center"
        }}
      >
        <svg style={{ overflow: "visible" }} width="9em" viewBox={[-1, -1, 2, 1].join(" ")}>
          <defs>
            <linearGradient id="Gauge__gradient" gradientUnits="userSpaceOnUse" x1="-1" x2="1" y2="0">
              {gradientSteps.map((colors, index) => (
                <stop key={colors} stopColor={colors} offset={`${index / (gradientSteps.length - 1)}`} />
              ))}
            </linearGradient>
          </defs>
          <path d={backgroundArc} fill="#dbdbe7" />
          <path d={filledArc} fill="url(#Gauge__gradient)" />
          <line y1="-1" y2="-0.65" stroke="white" strokeWidth="0.027" />
          <circle
            cx={markerLocation[0]}
            cy={markerLocation[1]}
            r="0.2"
            stroke="#2c3e50"
            strokeWidth="0.01"
            fill={colorScale(percent)}
          />
          <path
            d="M0.136364 0.0290102C0.158279 -0.0096701 0.219156 -0.00967009 0.241071 0.0290102C0.297078 0.120023 0.375 0.263367 0.375 0.324801C0.375 0.422639 0.292208 0.5 0.1875 0.5C0.0852272 0.5 -1.8346e-08 0.422639 -9.79274e-09 0.324801C0.00243506 0.263367 0.0803571 0.120023 0.136364 0.0290102ZM0.1875 0.381684C0.221591 0.381684 0.248377 0.356655 0.248377 0.324801C0.248377 0.292947 0.221591 0.267918 0.1875 0.267918C0.153409 0.267918 0.126623 0.292947 0.126623 0.324801C0.126623 0.356655 0.155844 0.381684 0.1875 0.381684Z"
            transform={`rotate(${angle * (180 / Math.PI)}) translate(-0.2, -0.33)`}
            fill="#6a6a85"
          />
        </svg>

        <div
          style={{
            textAlign: "center",
            marginTop: "0.4em",
            fontSize: "3em",
            lineHeight: "1em",
            fontWeight: "900",
            fontFeatureSettings: "'zero', 'tnum' 1"
          }}
        >
          {format(",")(value)}%
        </div>

        {!!label && (
          <div
            style={{
              textAlign: "center",
              color: "#8b8ba7",
              marginTop: "0.6em",
              fontSize: "1.3em",
              lineHeight: "1.3em",
              fontWeight: "700"
            }}
          >
            {label}
          </div>
        )}
      </div>
    );
  };

  const getCoordsOnArc = (angle, offset = 10) => [
    Math.cos(angle - Math.PI / 2) * offset,
    Math.sin(angle - Math.PI / 2) * offset
  ];

  const modelsToActivate = [MODEL_VIE, MODEL_ENG];

  const getListModels = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/model");
      return response.data.models.map((model) => model.name);
    } catch (error) {
      console.error("Error fetching model list:", error);
      setError("Error fetching model list");
      return [];
    }
  };

  const activateModel = async (modelName) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/model",
        { name: modelName },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.status === 200;
    } catch (error) {
      console.error(`Error activating model: ${modelName}`, error);
      setError(`Error activating model: ${modelName}`);
      return false;
    }
  };
  const fetchCorpusList = async () => {
    try {
      const { data } = await axios.get(`${HOST}/corpus`);
      setCorpusList(data.corpus);
    } catch (error) {
      console.error("Error fetching corpus list:", error);
    }
  };
  useEffect(() => {
    const activateModelsIfNeeded = async () => {
      const existingModels = await getListModels();
      const modelsToActivateFiltered = modelsToActivate.filter((model) => !existingModels.includes(model));

      if (modelsToActivateFiltered.length > 0) {
        const results = await Promise.all(modelsToActivateFiltered.map((model) => activateModel(model)));
        if (results.every((result) => result)) {
          setModelActivated(true);
        }
      } else {
        setModelActivated(true); // All models are already activated
      }
    };

    activateModelsIfNeeded();
  }, []);
  useEffect(() => {
    fetchCorpusList();
  }, []);

  const handleSelect = (index) => {
    if (index >= 0 && index < pairsByFirst.length) {
      setSelectedIdx(index);
    } else {
      // Xử lý trường hợp không tìm thấy file hoặc không có dữ liệu
      console.error("File not found or data is missing");
    }
  };

  const handleSelect_v3 = (index) => {
    if (index >= 0 && index < pairsByFirst_v3.length) {
      setSelectedIdx_v3(index);
    } else {
      // Xử lý trường hợp không tìm thấy file hoặc không có dữ liệu
      console.error("File not found or data is missing");
    }
  };

  const handleFileChange1 = async (event, inputIndex) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await fetch(`${HOST}/utility/files`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const fileData = data.files[0].raw;

      // Cập nhật file1 hoặc file2 dựa trên inputIndex
      if (inputIndex === 1) {
        setFile1(fileData);
        setSelectedFileName1(file.name);
        setNumberOfCharacters1(fileData.length);
      } else if (inputIndex === 2) {
        setFile2(fileData);
        setSelectedFileName2(file.name);
        setNumberOfCharacters2(fileData.length);
      } else if (inputIndex === 3) {
        setFile3(fileData);
        setSelectedFileName3(file.name);
        setNumberOfCharacters3(fileData.length);
      } else {
        setFile4(fileData);
        setSelectedFileName4(file.name);
        setNumberOfCharacters4(fileData.length);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading files");
    }
  };
  const handleRemoveFile1 = (inputIndex) => {
    if (inputIndex === 1) {
      setFile1(null);
      setSelectedFileName1(null); // Xóa tên tệp cho input 1
      setNumberOfCharacters1(0);
    } else if (inputIndex === 2) {
      setFile2(null);
      setSelectedFileName2(null); // Xóa tên tệp cho input 2
      setNumberOfCharacters2(0);
    } else if (inputIndex === 3) {
      setFile3(null);
      setSelectedFileName3(null); // Xóa tên tệp cho input 2
      setNumberOfCharacters3(0);
    } else {
      setFile4(null);
      setSelectedFileName4(null); // Xóa tên tệp cho input 2
      setNumberOfCharacters4(0);
    }
  };
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
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error uploading files");
      });
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1); // Xóa file khỏi mảng selectedFiles
    setSelectedFiles(newFiles);
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
  const handleChangeInput3 = (e) => {
    const lengthOfCharacters = e.target.value.length;

    if (lengthOfCharacters <= MAXIMUM_NUMBER_OF_CHARACTERS) {
      setNumberOfCharacters3(lengthOfCharacters);
      setInputs3(e.target.value);
    } else {
      const value = e.target.value.slice(0, MAXIMUM_NUMBER_OF_CHARACTERS);
      setNumberOfCharacters3(value.length);
      setInputs3(value);
    }
  };
  const handleChangeInput4 = (e) => {
    const lengthOfCharacters = e.target.value.length;

    if (lengthOfCharacters <= MAXIMUM_NUMBER_OF_CHARACTERS) {
      setNumberOfCharacters4(lengthOfCharacters);
      setInputs4(e.target.value);
    } else {
      const value = e.target.value.slice(0, MAXIMUM_NUMBER_OF_CHARACTERS);
      setNumberOfCharacters4(value.length);
      setInputs4(value);
    }
  };
  const handleTextSimVIE = async () => {
    try {
      setLoading(true);

      const requestData = {
        model: MODEL_VIE,
        threshold: 0.7
      };

      // Xử lý input 1 (inputs1 hoặc file1)
      if (inputType1 === "text") {
        requestData.one = { type: "RAW", raw: inputs1 };
      } else if (inputType1 === "file" && file1) {
        // Kiểm tra file1 có tồn tại
        requestData.one = { type: "RAW", raw: file1 };
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 1");
      }

      // Xử lý input 2 (inputs2 hoặc file2)
      if (inputType2 === "text") {
        requestData.many = [{ type: "RAW", raw: inputs2 }];
      } else if (inputType2 === "file" && file2) {
        // Kiểm tra file2 có tồn tại
        requestData.many = [{ type: "RAW", raw: file2 }];
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 2");
      }

      const { data } = await axios.post(`${HOST}/compare/one-many`, requestData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data) {
        setData(data);
        setError("");
      } else {
        setError(t("textError2")); // Lỗi từ phía server
      }
    } catch (error) {
      if (error.message.includes("Vui lòng nhập")) {
        // Nếu lỗi do người dùng chưa nhập đủ dữ liệu, hiển thị thông báo cụ thể
        setError(error.message);
      } else {
        setError(t("textError1")); // Lỗi khác (ví dụ: lỗi mạng)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextSimENG = async () => {
    try {
      setLoading(true);

      const requestData = {
        model: MODEL_ENG,
        threshold: 0.7
      };

      // Xử lý input 1 (inputs1 hoặc file1)
      if (inputType1 === "text") {
        requestData.one = { type: "RAW", raw: inputs1 };
      } else if (inputType1 === "file" && file1) {
        // Kiểm tra file1 có tồn tại
        requestData.one = { type: "RAW", raw: file1 };
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 1");
      }

      // Xử lý input 2 (inputs2 hoặc file2)
      if (inputType2 === "text") {
        requestData.many = [{ type: "RAW", raw: inputs2 }];
      } else if (inputType2 === "file" && file2) {
        // Kiểm tra file2 có tồn tại
        requestData.many = [{ type: "RAW", raw: file2 }];
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 2");
      }

      const { data } = await axios.post(`${HOST}/compare/one-many`, requestData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data) {
        setData(data);
        setError("");
      } else {
        setError(t("textError2")); // Lỗi từ phía server
      }
    } catch (error) {
      if (error.message.includes("Vui lòng nhập")) {
        // Nếu lỗi do người dùng chưa nhập đủ dữ liệu, hiển thị thông báo cụ thể
        setError(error.message);
      } else {
        setError(t("textError1")); // Lỗi khác (ví dụ: lỗi mạng)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextSimVIE_v2 = async () => {
    try {
      setLoading(true);

      const requestData = {
        model: MODEL_VIE,
        threshold: 0.7
      };

      // Xử lý input 1 (inputs3 hoặc file3)
      if (inputType3 === "text") {
        requestData.one = { type: "RAW", raw: inputs3 };
      } else if (inputType3 === "file" && file3) {
        // Kiểm tra file3 có tồn tại
        requestData.one = { type: "RAW", raw: file3 };
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 1");
      }

      // Xử lý input 2 (nhiều file từ inputArray)
      const manyData = inputArray.map((item) => ({
        type: "RAW",
        raw: item.data // Sử dụng dữ liệu từng bài trong inputArray
      }));
      requestData.many = manyData;

      const { data } = await axios.post(`${HOST}/compare/one-many`, requestData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data) {
        // Cập nhật tên tệp cho các kết quả trong mảng many
        const updatedMany = data.many.map((item, index) => ({
          ...item,
          fileName: inputArray[index].name
        }));

        // Cập nhật data với many đã được cập nhật
        const updatedData = {
          ...data,
          many: updatedMany
        };
        setData_v2(updatedData);
        setError("");
      } else {
        setError(t("textError2")); // Lỗi từ phía server
      }
    } catch (error) {
      if (error.message.includes("Vui lòng nhập")) {
        // Nếu lỗi do người dùng chưa nhập đủ dữ liệu, hiển thị thông báo cụ thể
        setError(error.message);
      } else {
        setError(t("textError1")); // Lỗi khác (ví dụ: lỗi mạng)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextSimENG_v2 = async () => {
    try {
      setLoading(true);

      const requestData = {
        model: MODEL_ENG,
        threshold: 0.7
      };

      // Xử lý input 1 (inputs3 hoặc file3)
      if (inputType3 === "text") {
        requestData.one = { type: "RAW", raw: inputs3 };
      } else if (inputType3 === "file" && file3) {
        // Kiểm tra file3 có tồn tại
        requestData.one = { type: "RAW", raw: file3 };
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 1");
      }

      // Xử lý input 2 (nhiều file từ inputArray)
      const manyData = inputArray.map((item) => ({
        type: "RAW",
        raw: item.data // Sử dụng dữ liệu từng bài trong inputArray
      }));
      requestData.many = manyData;

      const { data } = await axios.post(`${HOST}/compare/one-many`, requestData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data) {
        // Cập nhật tên tệp cho các kết quả trong mảng many
        const updatedMany = data.many.map((item, index) => ({
          ...item,
          fileName: inputArray[index].name
        }));

        // Cập nhật data với many đã được cập nhật
        const updatedData = {
          ...data,
          many: updatedMany
        };
        setData_v2(updatedData);
        setError("");
      } else {
        setError(t("textError2")); // Lỗi từ phía server
      }
    } catch (error) {
      if (error.message.includes("Vui lòng nhập")) {
        // Nếu lỗi do người dùng chưa nhập đủ dữ liệu, hiển thị thông báo cụ thể
        setError(error.message);
      } else {
        setError(t("textError1")); // Lỗi khác (ví dụ: lỗi mạng)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextSimVIE_v3 = async () => {
    try {
      setLoading(true);

      const requestData = {
        model: MODEL_VIE,
        threshold: 0.5,
        corpus_ids: [selectedCorpusId]
      };
      // Xử lý input 1 (inputs4 hoặc file4)
      if (inputType4 === "text") {
        requestData.text = { type: "RAW", raw: inputs4 };
      } else if (inputType4 === "file" && file4) {
        // Kiểm tra file4 có tồn tại
        requestData.text = { type: "RAW", raw: file4 };
      } else {
        throw new Error("Vui lòng nhập văn bản hoặc chọn tệp cho input 1");
      }

      const { data } = await axios.post(`${HOST}/compare/corpus`, requestData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data) {
        setData_v3(data);
        setError("");
      } else {
        setError(t("textError2"));
      }
    } catch (error) {
      if (error.message.includes("Vui lòng nhập")) {
        // Nếu lỗi do người dùng chưa nhập đủ dữ liệu, hiển thị thông báo cụ thể
        setError(error.message);
      } else {
        setError(t("textError1"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTextSimENG_v3 = async () => {
    try {
      setLoading(true);

      const payload = {
        model: MODEL_ENG,
        threshold: 0.5,
        text: {
          type: "RAW",
          raw: inputs4
        },
        corpus_ids: [selectedCorpusId]
      };

      const { data } = await axios.post(`${HOST}/compare/corpus`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (data) {
        setData_v3(data); // Lưu kết quả vào state ENG_v3
        setError("");
      } else {
        setError(t("textError2"));
      }

      setLoading(false);
    } catch (error) {
      setError(t("textError1"));
      setLoading(false);
    }
  };

  const highlightSimilarSentences = (flag) => {
    if (!data) {
      return;
    }
    const pairs = data.pairs[0];
    // Khởi tạo mảng mới để lưu trữ các cặp câu đã được tô màu
    const highlightedSentences = [];

    // Đối tượng để theo dõi trạng thái của từng câu 1
    const coloredIndexesFirst = {};

    // Đối tượng để theo dõi trạng thái của từng câu 2
    const coloredIndexesSecond = {};

    pairs.forEach((pair, index) => {
      const { first_sentence, second_sentence, score } = pair;

      // Kiểm tra xem câu 1 và câu 2 đã được tô màu chưa
      if (!coloredIndexesFirst[first_sentence] && !coloredIndexesSecond[second_sentence]) {
        // Nếu chưa, tô màu cho câu 1 và cập nhật trạng thái của nó
        highlightedSentences.push({ first_sentence, second_sentence, color: colorMap[index + 1], score });
        coloredIndexesFirst[first_sentence] = true;
        coloredIndexesSecond[second_sentence] = true;
      }
      if (coloredIndexesFirst[first_sentence] && !coloredIndexesSecond[second_sentence]) {
        // Nếu câu 1 đã được tô màu, gán màu của câu 1 cho câu 2
        const colorOffirst_sentence = highlightedSentences.find(
          (sentence) => sentence.first_sentence === first_sentence
        ).color;
        highlightedSentences.push({ first_sentence, second_sentence, color: colorOffirst_sentence, score });
        coloredIndexesSecond[second_sentence] = true;
      }
      if (!coloredIndexesFirst[first_sentence] && coloredIndexesSecond[second_sentence]) {
        // Nếu câu 2 đã được tô màu, gán màu của câu 2 cho câu 1
        const colorOfsecond = highlightedSentences.find(
          (sentence) => sentence.second_sentence === second_sentence
        ).color;
        highlightedSentences.push({ first_sentence, second_sentence, color: colorOfsecond, score });
        coloredIndexesFirst[first_sentence] = true;
      }
    });
    // Khởi tạo mảng kết quả
    const output = [];

    // Duyệt qua từng câu trong văn bản và tô màu tương ứng
    if (flag === 1) {
      const sentences = data.one.sentences;
      const endOfParagraphIndexes = data.one.paragraph_index.slice(0, -1).map((paragraph) => paragraph[1]);
      sentences.forEach((sentence, index) => {
        let sentenceColored = false;
        highlightedSentences.forEach((pair) => {
          if (index === pair.first_sentence && !sentenceColored) {
            output.push(
              `<span style="background-color: ${pair.color};  cursor: pointer " ; title=" ${t("score")}: ${
                pair.score
              }" onClick="handleClick(${pair.second_sentence},'${pair.color}', ${pair.score}, 2)">${sentence}</span>`
            );
            sentenceColored = true; // Đánh dấu câu đã được tô màu
          }
        });

        if (!sentenceColored) {
          output.push(sentence);
        }
        if (endOfParagraphIndexes.includes(index)) {
          output.push("\n\n");
        }
      });
    } else if (flag === 2) {
      const sentences = data.many[0].sentences;
      const endOfParagraphIndexes = data.many[0].paragraph_index.slice(0, -1).map((paragraph) => paragraph[1]);
      sentences.forEach((sentence, index) => {
        let sentenceColored = false;

        highlightedSentences.forEach((pair) => {
          if (index === pair.second_sentence && !sentenceColored) {
            output.push(
              `<span style="background-color: ${pair.color};  cursor: pointer " ; title=" ${t("score")}: ${
                pair.score
              }" onClick="handleClick(${pair.first_sentence},'${pair.color}', ${pair.score}, 1)">${sentence}</span>`
            );
            sentenceColored = true; // Đánh dấu câu đã được tô màu
          }
        });

        if (!sentenceColored) {
          output.push(sentence);
        }
        if (endOfParagraphIndexes.includes(index)) {
          output.push("\n\n");
        }
      });
    }

    // Kết hợp các câu đã được tô màu và trả về văn bản hoàn chỉnh
    return output.join(" ");
  };

  window.handleClick = (index, color, score, flag) => {
    const scrollableDiv = document.getElementById(`scrollableDiv${flag}`);
    let sentence;

    if (flag === 1) {
      sentence = data.one.sentences[index];
    } else if (flag === 2) {
      sentence = data.many[0].sentences[index];
    }
    const spans = scrollableDiv.querySelectorAll("span");
    let targetElement;
    if (scrollableDiv) {
      spans.forEach((span) => {
        if (span.textContent.includes(sentence)) {
          targetElement = span;
        }
      });
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setScorev1(score);
        setColorv1(color);
        setClickv1(true);
      } else {
        scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      }
    }
  };

  const highlightSimilarSentencesv2 = () => {
    if (!data_v2) {
      return;
    }

    // Kiểm tra nếu không có cặp câu nào được cung cấp hoặc không có mảng kết quả, trả về văn bản gốc không được tô màu
    const sentences = data_v2.one.sentences;
    // Khởi tạo mảng mới để lưu trữ các câu đã được tô màu
    const highlightedSentences = [];

    // Tạo đối tượng để theo dõi trạng thái của các chỉ số đã được tô màu
    const coloredIndexes = {};
    let index = 0;
    data_v2.pairs.forEach((result) => {
      // Duyệt qua từng cặp trong đối tượng result
      result.forEach((pair) => {
        const { first_sentence, score } = pair;
        if (!coloredIndexes[first_sentence]) {
          highlightedSentences.push({ first_sentence, color: colorMap[index + 1], score });
          coloredIndexes[first_sentence] = true;
          index = index + 1;
        }
      });
    });
    // Khởi tạo mảng kết quả
    const output = [];

    // Duyệt qua từng câu trong văn bản và tô màu tương ứng
    const endOfParagraphIndexes = data_v2.one.paragraph_index.slice(0, -1).map((paragraph) => paragraph[1]);
    sentences.forEach((sentence, index) => {
      let sentenceColored = false;

      highlightedSentences.forEach((pair) => {
        if (coloredIndexes[index] && index === pair.first_sentence) {
          output.push(
            `<span style="background-color: ${pair.color} ;  cursor: pointer"; title= ${t("score")}: ${
              pair.score
            }" onClick="handleClickv2(${pair.first_sentence},'${pair.color}')">${sentence}</span>`
          );
          sentenceColored = true;
        }
      });
      if (!sentenceColored) {
        output.push(sentence);
      }
      if (endOfParagraphIndexes.includes(index)) {
        output.push("\n\n");
      }
    });
    // Kết hợp các câu đã được tô màu và trả về văn bản hoàn chỉnh
    return output.join(" ");
  };

  window.handleClickv2 = (firstToFind, color) => {
    setSelectedIdx(null);
    const fileNames = [];

    data_v2.many.forEach((fileData) => {
      fileNames.push(fileData.fileName);
    });
    // Tạo một mảng để lưu các cặp thỏa mãn điều kiện
    const pairsArray = [];

    // Duyệt qua mảng data_v2.pairs và tìm các cặp có first_sentence bằng firstToFind
    data_v2.pairs.forEach((resultArray, index) => {
      resultArray.forEach((pair) => {
        if (pair.first_sentence === firstToFind) {
          pairsArray.push({
            filename: fileNames[index],
            second_sentence: pair.second_sentence,
            over_score: data_v2.similarities[index],
            score: pair.score,
            color: color
          });
        }
      });
    });

    // Cập nhật state với mảng các cặp tìm được
    setPairsByFirst(pairsArray);
  };

  const highlightSidePanelv2 = (fileName, index, color) => {
    if (!data_v2) {
      alert("Data not available.");
      return;
    }
    const fileObject = data_v2.many.find((file) => file.fileName === fileName);

    // Kiểm tra xem fileObject có tồn tại và có thuộc tính sentences không
    if (fileObject && fileObject.sentences) {
      const sentences = fileObject.sentences;
      const highlightedSentences = [];

      if (index !== 0 && index !== sentences.length - 1) {
        highlightedSentences.push(" . . . ");
        highlightedSentences.push(sentences[index - 1]);
        highlightedSentences.push(`<span style="background-color: ${color}">${sentences[index]}</span>`);
        highlightedSentences.push(sentences[index + 1]);
        highlightedSentences.push(" . . . ");
      } else if (index === 0) {
        highlightedSentences.push(`<span style="background-color: ${color}">${sentences[index]}</span>`);
        highlightedSentences.push(sentences[index + 1]);
        highlightedSentences.push(" . . . ");
      } else if (index === sentences.length - 1) {
        highlightedSentences.push(" . . . ");
        highlightedSentences.push(sentences[index - 1]);
        highlightedSentences.push(`<span style="background-color: ${color}">${sentences[index]}</span>`);
      }

      return highlightedSentences.join("");
    } else {
      return;
    }
  };
  const highlightSimilarSentencesv3 = () => {
    if (!data_v3 || !data_v3.text) {
      return; // Kiểm tra data_v3 và data_v3.text trước khi xử lý
    }

    const sentences = data_v3.text.sentences;
    const highlightedSentences = [];
    const coloredIndexes = {};

    // Tối ưu vòng lặp: chỉ cần duyệt qua một vòng thay vì hai vòng lồng nhau
    data_v3.corpus_documents.flat().forEach((document) => {
      document.pairs.forEach((pair) => {
        const { first_sentence, score } = pair;
        if (!coloredIndexes[first_sentence]) {
          highlightedSentences.push({
            first_sentence,
            color: colorMap[highlightedSentences.length + 1],
            score
          });
          coloredIndexes[first_sentence] = true;
        }
      });
    });

    const output = [];
    const endOfParagraphIndexes =
      data_v3.text.paragraph_index && data_v3.text.paragraph_index.length > 0
        ? data_v3.text.paragraph_index.slice(0, -1).map((paragraph) => paragraph[1])
        : [];
    sentences.forEach((sentence, index) => {
      let sentenceColored = false;

      highlightedSentences.forEach((pair) => {
        if (index === pair.first_sentence) {
          // So sánh index với first_sentence của pair
          output.push(
            `<span style="background-color: ${pair.color}";  cursor: pointer ; title="${t("score")}: ${
              pair.score
            }" onClick="handleClickv3(${pair.first_sentence},'${pair.color}')">${sentence}</span>`
          );
          sentenceColored = true;
        }
      });
      if (!sentenceColored) {
        output.push(sentence);
      }
      if (endOfParagraphIndexes.includes(index)) {
        output.push("\n\n");
      }
    });

    return output.join(" ");
  };

  window.handleClickv3 = (firstToFind, color) => {
    setSelectedIdx_v3(null);
    const pairsArray = [];

    // Duyệt qua mảng data_v3.corpus_documents và tìm các cặp có first_sentence bằng firstToFind
    data_v3.corpus_documents.forEach((resultArray) => {
      resultArray.forEach((document) => {
        document.pairs.forEach((pair) => {
          if (pair.first_sentence === firstToFind) {
            pairsArray.push({
              filename: document.document.title,
              second_sentence: pair.second_sentence,
              over_score: document.similarity,
              score: pair.score,
              color: color
            });
          }
        });
      });
    });

    // Cập nhật state với mảng các cặp tìm được
    setPairsByFirst_v3(pairsArray);
  };

  const highlightSidePanelv3 = () => {
    if (!data_v3 || !data_v3.corpus_documents || !pairsByFirst_v3[selectedIdx_v3]) {
      return;
    }

    const fileName = pairsByFirst_v3[selectedIdx_v3].filename;
    const index = pairsByFirst_v3[selectedIdx_v3].second_sentence;
    const color = pairsByFirst_v3[selectedIdx_v3].color;
    // Sử dụng flat() để làm phẳng mảng lồng nhau
    const document = data_v3.corpus_documents.flat().find((doc) => doc.document.title === fileName);

    if (document && document.document.text.sentences) {
      const sentences = document.document.text.sentences;
      const highlightedSentences = [];

      if (index !== 0 && index !== sentences.length - 1) {
        highlightedSentences.push(" . . . ");
        highlightedSentences.push(sentences[index - 1]);
        highlightedSentences.push(`<span style="background-color: ${color}">${sentences[index]}</span>`);
        highlightedSentences.push(sentences[index + 1]);
        highlightedSentences.push(" . . . ");
      } else if (index === 0) {
        highlightedSentences.push(`<span style="background-color: ${color}">${sentences[index]}</span>`);
        highlightedSentences.push(sentences[index + 1]);
        highlightedSentences.push(" . . . ");
      } else if (index === sentences.length - 1) {
        highlightedSentences.push(" . . . ");
        highlightedSentences.push(sentences[index - 1]);
        highlightedSentences.push(`<span style="background-color: ${color}">${sentences[index]}</span>`);
      }

      return highlightedSentences.join(" ");
    } else {
      return "";
    }
  };

  const renderInputFields = () => {
    switch (mode) {
      case "1":
        return (
          <>
            <div className="flex flex-col justify-center w-2/5 mr-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={inputType1 === "file"}
                  onChange={() => setInputType1(inputType1 === "text" ? "file" : "text")}
                  className="mr-2"
                />
                <label htmlFor="upload1">Tải lên tệp</label>
              </div>
              <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                {inputType1 === "text" ? (
                  <div className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <textarea
                      id="search"
                      rows={8}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0 dark:text-white dark:placeholder-gray-400 outline-0"
                      placeholder={t("placeholderText")}
                      required
                      value={inputs1}
                      onChange={handleChangeInput1}
                    />
                    <label
                      htmlFor="text"
                      className="absolute text-xs text-gray-900 opacity-70 right-4 bottom-4 dark:text-gray-300"
                    >
                      {numberOfCharacters1} / {MAXIMUM_NUMBER_OF_CHARACTERS}
                    </label>
                  </div>
                ) : (
                  <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                    <input
                      type="file"
                      onChange={(e) => {
                        handleFileChange1(e, 1);
                      }}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                    />
                    <div>
                      {selectedFileName1 && ( // Chỉ hiển thị khi có tên tệp
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-100 dark:bg-gray-800 mb-2">
                          <span>{selectedFileName1}</span>
                          <button
                            className="text-blue-500 underline hover:text-red-500"
                            onClick={() => handleRemoveFile1(1)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Button */}
            <button
              type="button"
              className={`inline-flex items-center py-2.5 px-4 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800 ${
                loading ||
                (inputType1 === "text" && (inputs1.length <= 0 || inputs2.length <= 0)) ||
                (inputType1 === "file" && !file1) || // Kiểm tra file1 null
                (inputType2 === "text" && (inputs1.length <= 0 || inputs2.length <= 0)) ||
                (inputType2 === "file" && !file2) // Kiểm tra file2 null
                  ? "cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                if (
                  (inputType1 === "text" && inputs1 && inputs2) ||
                  (inputType1 === "file" && file1 && inputs2) || // Kiểm tra file1
                  (inputType2 === "file" && inputs1 && file2) || // Kiểm tra file2
                  (inputType1 === "file" && inputType2 === "file" && file1 && file2) // Cả 2 đều là file
                ) {
                  if (language === "Vietnamese") {
                    handleTextSimVIE();
                  } else {
                    handleTextSimENG();
                  }
                  setData("");
                  setError("");
                  setClickbutton(true);
                  setClickv1(false);
                }
              }}
              title={
                (inputType1 === "text" && (!inputs1 || !inputs2)) ||
                (inputType1 === "file" && !file1) || // Kiểm tra file1 null
                (inputType2 === "text" && (!inputs1 || !inputs2)) ||
                (inputType2 === "file" && !file2) // Kiểm tra file2 null
                  ? "Cần nhập văn bản hoặc chọn tệp"
                  : ""
              }
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {/* Input2 */}
            <div className="flex flex-col justify-center w-2/5 mr-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={inputType2 === "file"}
                  onChange={() => setInputType2(inputType2 === "text" ? "file" : "text")}
                  className="mr-2"
                />
                <label htmlFor="upload1">Tải lên tệp</label>
              </div>
              <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                {inputType2 === "text" ? (
                  <div className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <textarea
                      id="search"
                      rows={8}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0 dark:text-white dark:placeholder-gray-400 outline-0"
                      placeholder={t("placeholderText")}
                      required
                      value={inputs2}
                      onChange={handleChangeInput2}
                    />
                    <label
                      htmlFor="text"
                      className="absolute text-xs text-gray-900 opacity-70 right-4 bottom-4 dark:text-gray-300"
                    >
                      {numberOfCharacters1} / {MAXIMUM_NUMBER_OF_CHARACTERS}
                    </label>
                  </div>
                ) : (
                  <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                    <input
                      type="file"
                      onChange={(e) => {
                        handleFileChange1(e, 2);
                      }}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                    />
                    <div>
                      {selectedFileName2 && ( // Chỉ hiển thị khi có tên tệp
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-100">
                          <span>{selectedFileName2}</span>
                          <button
                            className="text-blue-500 underline hover:text-red-500"
                            onClick={() => handleRemoveFile1(2)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case "2":
        return (
          <>
            <div className="flex flex-col justify-center w-2/5 mr-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={inputType3 === "file"}
                  onChange={() => setInputType3(inputType3 === "text" ? "file" : "text")}
                  className="mr-2"
                />
                <label htmlFor="upload1">Tải lên tệp</label>
              </div>
              <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                {inputType3 === "text" ? (
                  <div className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <textarea
                      id="search"
                      rows={8}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0 dark:text-white dark:placeholder-gray-400 outline-0"
                      placeholder={t("placeholderText")}
                      required
                      value={inputs3}
                      onChange={handleChangeInput3}
                    />
                    <label
                      htmlFor="text"
                      className="absolute text-xs text-gray-900 opacity-70 right-4 bottom-4 dark:text-gray-300"
                    >
                      {numberOfCharacters3} / {MAXIMUM_NUMBER_OF_CHARACTERS}
                    </label>
                  </div>
                ) : (
                  <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                    <input
                      type="file"
                      onChange={(e) => {
                        handleFileChange1(e, 3);
                      }}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                    />
                    <div>
                      {selectedFileName3 && ( // Chỉ hiển thị khi có tên tệp
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-100 dark:bg-gray-800 mb-2">
                          <span>{selectedFileName3}</span>
                          <button
                            className="text-blue-500 underline hover:text-red-500"
                            onClick={() => handleRemoveFile1(3)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Button */}
            <button
              type="button"
              className={`inline-flex items-center py-2.5 px-4 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800 ${
                loading || (inputType3 === "text" ? inputs3.length <= 0 : !file3) || inputArray.length === 0
                  ? "cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                const selectedHandler = language === "Vietnamese" ? handleTextSimVIE_v2 : handleTextSimENG_v2;
                // Gọi hàm được chọn dựa trên ngôn ngữ được chọn
                selectedHandler();

                // Tiếp tục với các hành động khác
                setPairsByFirst([]); // Đảm bảo bạn có setPairsByFirst để sử dụng ở phần hiển thị kết quả
                setClickbutton(true);
                setSelectedIdx("");
              }}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {/* Input 2 */}

            <div className="flex flex-col justify-center w-2/5 ml-4">
              <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                />
                <div>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-4 bg-gray-100 dark:bg-gray-800 mb-2"
                    >
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
          </>
        );
      case "3":
        return (
          <>
            {/* Input 1 */}
            <div className="flex flex-col justify-center w-2/5 mr-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={inputType4 === "file"}
                  onChange={() => setInputType4(inputType4 === "text" ? "file" : "text")}
                  className="mr-2"
                />
                <label htmlFor="upload1">Tải lên tệp</label>
              </div>
              <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                {inputType4 === "text" ? (
                  <div className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <textarea
                      id="search"
                      rows={8}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0 "
                      placeholder={t("placeholderText")}
                      required
                      value={inputs4}
                      onChange={handleChangeInput4}
                    />
                    <label
                      htmlFor="text"
                      className="absolute text-xs text-gray-900 opacity-70 right-4 bottom-4 dark:text-gray-300"
                    >
                      {numberOfCharacters4} / {MAXIMUM_NUMBER_OF_CHARACTERS}
                    </label>
                  </div>
                ) : (
                  <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                    <input
                      type="file"
                      onChange={(e) => {
                        handleFileChange1(e, 4);
                      }}
                      className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                    />
                    <div>
                      {selectedFileName4 && ( // Chỉ hiển thị khi có tên tệp
                        <div className="flex items-center justify-between py-2 px-4 bg-gray-100">
                          <span>{selectedFileName4}</span>
                          <button
                            className="text-blue-500 underline hover:text-red-500"
                            onClick={() => handleRemoveFile1(4)}
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Button */}
            <button
              type="button"
              className={`inline-flex items-center py-2.5 px-4 text-base font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800 ${
                loading ||
                (inputType4 === "text" && inputs4.length <= 0) || // Nếu là text thì inputs4 phải có nội dung
                (inputType4 === "file" && !file4) || // Nếu là file thì file4 phải tồn tại
                !selectedCorpusId // Corpus phải được chọn
                  ? "cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                const selectedHandler = language === "Vietnamese" ? handleTextSimVIE_v3 : handleTextSimENG_v3;
                selectedHandler();
                setPairsByFirst_v3([]);
                setClickbutton(true);
                setSelectedIdx_v3("");
              }}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Combobox to select corpus */}
            <div className="flex flex-col justify-center w-2/5 ml-4">
              <div className="w-full mb-8 border border-gray-200 rounded-lg bg-gray-50">
                <select
                  value={selectedCorpusId}
                  onChange={(e) => setSelectedCorpusId(e.target.value)}
                  className="w-full px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 resize-none focus:ring-0"
                >
                  <option value="">-- Chọn corpus --</option>
                  {corpusList.map((corpus) => (
                    <option key={corpus._id} value={corpus._id}>
                      {corpus.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!clickbutton) return null;
    if (mode === "1") {
      const hasPairs = data && data.pairs && data.pairs.length > 0;

      if (!error && !loading && !hasPairs) {
        // Nếu không có cặp câu tương đồng, hiển thị thông báo
        return (
          <div className="mb-18 items-center justify-center">
            <p className="mb-3 text-xl font-bold text-center text-green-600">
              Các văn bản này không tương đồng với nhau.
            </p>
          </div>
        );
      }

      return (
        <div className="mb-20 justify-center items-center">
          {!error && data && data.similarity !== undefined && (
            <p className="mb-3 text-xl font-bold text-center text-green-600">
              Độ tương đồng giữa hai văn bản: {(parseFloat(data.similarity) * 100).toFixed(0)}%
            </p>
          )}

          <div className="mb-20 flex justify-center items-center">
            {loading ? (
              <div class="loader">
                <div>
                  <ul>
                    <li>
                      <svg fill="currentColor" viewBox="0 0 90 120">
                        <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                      </svg>
                    </li>
                    <li>
                      <svg fill="currentColor" viewBox="0 0 90 120">
                        <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                      </svg>
                    </li>
                    <li>
                      <svg fill="currentColor" viewBox="0 0 90 120">
                        <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                      </svg>
                    </li>
                    <li>
                      <svg fill="currentColor" viewBox="0 0 90 120">
                        <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                      </svg>
                    </li>
                    <li>
                      <svg fill="currentColor" viewBox="0 0 90 120">
                        <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                      </svg>
                    </li>
                    <li>
                      <svg fill="currentColor" viewBox="0 0 90 120">
                        <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                      </svg>
                    </li>
                  </ul>
                </div>
                <span>Loading</span>
              </div>
            ) : (
              <div className="mb-17 flex justify-center items-center">
                {loading
                  ? null
                  : !clickv1
                  ? null
                  : Gauge((parseFloat(scorev1) * 100).toFixed(0), 0, 100, "Tương đồng", colorv1)}
              </div>
            )}
            {error && <p className="mb-3 font-normal text-red-700">{error}</p>}

            <div className="mb-12 grid grid-cols-2 gap-8">
              <div>
                {loading ? null : (
                  <div>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{t("text")} 1</h5>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div id="scrollableDiv1" style={{ overflow: "auto", maxHeight: "650px" }}>
                        <pre
                          className="mb-3 font-normal text-gray-700 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: highlightSimilarSentences(1)
                          }}
                        ></pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                {loading ? null : (
                  <div>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{t("text")} 2</h5>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div id="scrollableDiv2" style={{ overflow: "auto", maxHeight: "650px" }}>
                        <pre
                          className="mb-3 font-normal text-gray-700 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: highlightSimilarSentences(2)
                          }}
                        ></pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (mode === "2") {
      const hasPairs = data_v2 && data_v2.pairs && data_v2.pairs.length > 0;

      if (!loading && !error && !hasPairs) {
        // Nếu không có cặp câu tương đồng, hiển thị thông báo
        return (
          <div className="mb-18 items-center justify-center">
            <p className="mb-3  text-xl font-bold text-center text-green-600">
              Các văn bản này không tương đồng với nhau.
            </p>
          </div>
        );
      }
      // Lọc danh sách các file tương đồng
      if (hasPairs) {
        const similarFiles = data_v2.many.filter((file, index) => data_v2.similarities[index] > 0);
        return (
          <div className="mb-20 justify-center items-center">
            <div className="border border-gray-300 rounded-lg p-4">
              <h6 className="mb-2 text-lg font-semibold">
                Độ tương đồng của văn bản: {(parseFloat(data_v2.similarity) * 100).toFixed(0)}%. Các tài liệu tương
                đồng:
              </h6>
              <ul className="list-disc list-inside">
                {similarFiles.map((file) => (
                  <li key={file.fileName}>{file.fileName}</li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-6 gap-1 p-1">
              {/* Phần bên trái */}
              <div className="col-span-3 p-2">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{t("text")} 1</h5>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {loading ? (
                    <div class="loader">
                      <div>
                        <ul>
                          <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                          </li>
                          <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                          </li>
                          <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                          </li>
                          <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                          </li>
                          <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                          </li>
                          <li>
                            <svg fill="currentColor" viewBox="0 0 90 120">
                              <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                            </svg>
                          </li>
                        </ul>
                      </div>
                      <span>Loading</span>
                    </div>
                  ) : (
                    <div style={{ overflow: "auto", maxHeight: "800px" }}>
                      <pre
                        className="mb-3 font-normal text-gray-700 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: highlightSimilarSentencesv2()
                        }}
                      ></pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 p-2">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Độ tương đồng</h5>
                <div className="h-70 overflow-y-auto border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                  {selectedIdx !== null && pairsByFirst[selectedIdx] ? (
                    <div className="w-full">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: highlightSidePanelv2(
                            pairsByFirst[selectedIdx].filename,
                            pairsByFirst[selectedIdx].second_sentence,
                            pairsByFirst[selectedIdx].color
                          )
                        }}
                      ></div>
                      <div className="mt-4 flex justify-center">
                        {Gauge(
                          (parseFloat(pairsByFirst[selectedIdx].score) * 100).toFixed(0),
                          0,
                          100,
                          "Tương đồng",
                          pairsByFirst[selectedIdx].color
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>Vui lòng chọn câu tương đồng muốn hiển thị</div>
                  )}
                </div>
              </div>

              {/* Danh sách các câu tương đồng */}
              <div className="col-span-1 p-2">
                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">Danh sách các câu tương đồng</h5>{" "}
                <div className="h-70 overflow-y-auto border border-gray-300 rounded-lg">
                  {pairsByFirst.map((result, index) => (
                    <div key={index}>
                      {/* Button mở side panel */}
                      <button
                        onClick={() => {
                          handleSelect(index);
                          highlightSidePanelv2();
                        }}
                        className={`flex-shrink-0 flex-grow-0 flex justify-between items-center border border-gray-300 p-4 m-2 rounded-lg shadow-md text-sm ${
                          selectedIdx === index ? "bg-blue-200" : "hover:bg-gray-100"
                        }`}
                        style={{ backgroundColor: result.color, transition: "background-color 0.3s" }}
                      >
                        <div>
                          {" "}
                          <h5 className="mb-1 font-bold text-black">{result.filename}</h5>{" "}
                          <p className="mb-1 text-sm text-gray-700">
                            {t("score")}: {(parseFloat(result.over_score) * 100).toFixed(2)}%
                          </p>{" "}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else {
      const hasPairs =
        data_v3 &&
        data_v3.corpus_documents &&
        data_v3.corpus_documents.some((documentArray) =>
          documentArray.some((document) => document.pairs && document.pairs.length > 0)
        );

      if (!loading && !error && !hasPairs) {
        // Nếu không có cặp câu tương đồng, hiển thị thông báo
        return (
          <div className="mb-18 items-center justify-center">
            <p className="mb-3 text-xl font-bold text-center text-green-600">
              Các văn bản này không tương đồng với nhau.
            </p>
          </div>
        );
      }
      return (
        <div className="mb-20 justify-center items-center">
          {!error && !loading && data_v3 && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h6 className="mb-2 text-lg font-semibold">
                Độ tương đồng của văn bản: {(parseFloat(data_v3.similarity) * 100).toFixed(0)}%. Các tài liệu tương
                đồng:
              </h6>
              <ul className="list-disc list-inside">
                {data_v3.corpus_documents.flat().map(
                  (
                    doc // Làm phẳng mảng và duyệt qua từng document
                  ) => (
                    <li key={doc.document.title}>{doc.document.title}</li>
                  )
                )}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-6 gap-1 p-1">
            {/* Phần bên trái (Tương tự case 2) */}
            <div className="col-span-3 p-2">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{t("text")} 1</h5>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {loading ? (
                  <div class="loader">
                    <div>
                      <ul>
                        <li>
                          <svg fill="currentColor" viewBox="0 0 90 120">
                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                          </svg>
                        </li>
                        <li>
                          <svg fill="currentColor" viewBox="0 0 90 120">
                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                          </svg>
                        </li>
                        <li>
                          <svg fill="currentColor" viewBox="0 0 90 120">
                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                          </svg>
                        </li>
                        <li>
                          <svg fill="currentColor" viewBox="0 0 90 120">
                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                          </svg>
                        </li>
                        <li>
                          <svg fill="currentColor" viewBox="0 0 90 120">
                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                          </svg>
                        </li>
                        <li>
                          <svg fill="currentColor" viewBox="0 0 90 120">
                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                          </svg>
                        </li>
                      </ul>
                    </div>
                    <span>Loading</span>
                  </div>
                ) : (
                  // Hiển thị kết quả sau khi đã xử lý xong
                  <div style={{ overflow: "auto", maxHeight: "800px" }}>
                    <pre
                      className="mb-3 font-normal text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: highlightSimilarSentencesv3() // Hàm làm nổi bật câu tương đồng
                      }}
                    ></pre>
                  </div>
                )}
              </div>
            </div>

            {/* Phần giữa (Tương tự case 2, nhưng sử dụng dữ liệu từ pairsByFirst_v3) */}
            <div className="col-span-2 p-2">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Độ tương đồng</h5>
              <div className="h-70 overflow-y-auto border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                {selectedIdx_v3 !== null && pairsByFirst_v3[selectedIdx_v3] ? (
                  <div className="w-full">
                    <div dangerouslySetInnerHTML={{ __html: highlightSidePanelv3() }}></div>{" "}
                    {/* Hiển thị nội dung đã được làm nổi bật */}
                    <div className="mt-4 flex justify-center">
                      {Gauge(
                        (parseFloat(pairsByFirst_v3[selectedIdx_v3].score) * 100).toFixed(0),
                        0,
                        100,
                        "Tương đồng",
                        pairsByFirst_v3[selectedIdx_v3].color
                      )}
                    </div>
                  </div>
                ) : (
                  <div>Vui lòng chọn câu tương đồng muốn hiển thị</div>
                )}
              </div>
            </div>

            {/* Phần bên phải (Danh sách các câu tương đồng, tương tự case 2, nhưng sử dụng pairsByFirst_v3) */}
            <div className="col-span-1 p-2">
              <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">Danh sách các câu tương đồng</h5>
              <div className="h-70 overflow-y-auto border border-gray-300 rounded-lg">
                {pairsByFirst_v3.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleSelect_v3(index);
                      highlightSidePanelv3();
                    }}
                    className={` flex-shrink-0  flex-grow-0 flex justify-between items-center border border-gray-300 p-4 m-2 rounded-lg shadow-md text-sm ${
                      selectedIdx_v3 === index ? "bg-blue-200" : "hover:bg-gray-100"
                    }`}
                    style={{ backgroundColor: result.color, transition: "background-color 0.3s" }}
                  >
                    <div>
                      <h5 className="mb-1 font-bold text-black">{result.filename}</h5>
                      <p className="mb-1 text-sm text-gray-700">
                        {t("score")}: {(parseFloat(result.over_score) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto my-16 min-h-[800px]">
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
      {/* Chọn ngôn ngữ so sánh */}
      <div className="flex items-center justify-center mb-4">
        <div className="text-left pr-4">
          <p className="text-gray-600">Chọn ngôn ngữ so sánh</p>
        </div>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setClickbutton(false);
          }}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0 "
        >
          <option value="English">English</option>
          <option value="Vietnamese">Tiếng Việt</option>
        </select>
      </div>

      {/* Chọn chế độ */}
      <div className="flex items-center justify-center mb-4">
        <div className="text-left pr-4">
          <p className="text-gray-600">Chọn chế độ</p>
        </div>
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setClickv1(false);
          }}
          className="block w-1/8 px-4 py-2 text-base text-gray-900 bg-gray-50 border-0 rounded-lg focus:ring-0 "
        >
          <option value="1">Chế độ 1</option>
          <option value="2">Chế độ 2</option>
          <option value="3">Chế độ 3</option>
        </select>
      </div>

      <div className="flex items-center justify-center">{renderInputFields()}</div>

      {/* Error message */}
      <div className="mb-12 flex justify-center">
        {error && <p className="mb-3 font-normal text-red-700">{error}</p>}
      </div>

      <div className="border-t" />

      {/* Result */}
      <div className="mb-18 items-center justify-center">
        <h5 className="text-2xl font-bold text-gray-900 mb-4">{t("result")}</h5>
        {!error ? renderResults(mode) : null}
        {error && <p className="mb-3 font-normal text-red-700">{error}</p>}
      </div>
    </div>
  );
};

export default Product;
