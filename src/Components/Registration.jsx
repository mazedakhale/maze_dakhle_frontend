import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidName,
  validateRegistration,
} from "../utils/formValidators";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../index.css";
const SMS_URL = "http://localhost:3000/sms/send";
const SMS_SENDER = "918308178738"; // your LiveOne-registered “from” number

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    shopAddress: "",
    district: "",
    taluka: "",
    role: "Customer",
    profilePhoto: null, // ✅ new field

    aadharCard: null,
    panCard: null,
    agreeToTerms: false,
    errors: {},
  });

  const districtTalukaMap = {
    Akola: [
      "Akola",
      "Akot",
      "Balapur",
      "Patur",
      "Mhaisal",
      "Telhara",
      "Barshi Takli",
    ],
    Amravati: [
      "Amravati",
      "Chandur Bazar",
      "Chandur Railway",
      "Dhamangaon Railway",
      "Morshi",
      "Nandgaon Khandeshwar",
      "Nandgaon",
      "Telhara",
      "Vadwani",
    ],
    Buldhana: [
      "Buldhana",
      "Chikhli",
      "Deulgaon Raja",
      "Jalgaon Jamod",
      "Khamgaon",
      "Lonar",
      "Mehkar",
      "Motala",
      "Nandura",
      "Shegaon",
      "Sindkhed Raja",
    ],
    Yavatmal: [
      "Yavatmal",
      "Arni",
      "Babhulgaon",
      "Ghatanji",
      "Kalamb",
      "Mahagaon",
      "Ner",
      "Pandharkawda",
      "Pusad",
      "Umarkhed",
      "Wani",
      "Zari",
    ],
    Washim: ["Washim", "Malegaon", "Mangrulpir", "Risod", "Kalamb", "Karanja"],
    Dharashiv: [
      "Dharashiv",
      "Kalamb",
      "Lohara",
      "Mankheda",
      "Paranda",
      "Tuljapur",
      "Vashi",
    ],
    "Chhatrapati Sambhajinagar": [
      "Chhatrapati Sambhajinagar",
      "Kannad",
      "Khultabad",
      "Phulambri",
      "Gangapur",
      "Vaijapur",
      "Soygaon",
      "Sillod",
    ],
    Jalna: [
      "Jalna",
      "Ambad",
      "Badnapur",
      "Ghansawangi",
      "Jafrabad",
      "Mantha",
      "Partur",
      "Partad",
    ],
    Nanded: [
      "Nanded",
      "Ardhapur",
      "Bhokar",
      "Deglur",
      "Dharmabad",
      "Hadgaon",
      "Himayatnagar",
      "Kandhar",
      "Loha",
      "Mukhed",
      "Naigaon",
      "Umri",
    ],
    Parbhani: [
      "Parbhani",
      "Gangakhed",
      "Jintur",
      "Pathri",
      "Selu",
      "Majalgaon",
      "Palam",
      "Sonpeth",
    ],
    Beed: [
      "Beed",
      "Ambajogai",
      "Ashti",
      "Georai",
      "Kajal",
      "Majalgaon",
      "Parli",
      "Patoda",
      "Shirur Kasar",
      "Wadvani",
    ],
    Latur: [
      "Latur",
      "Ausa",
      "Chakur",
      "Deni",
      "Jalkot",
      "Nilanga",
      "Renapur",
      "Shirur Anantpal",
      "Udgir",
    ],
    Hingoli: [
      "Hingoli",
      "Kalamnuri",
      "Sengaon",
      "Vasmat",
      "Aundha Nagnath",
      "Basmat",
    ],
    Thane: [
      "Thane",
      "Bhiwandi",
      "Kalyan",
      "Ulhasnagar",
      "Ambernath",
      "Murbad",
      "Shahapur",
    ],
    Palghar: [
      "Palghar",
      "Vasai",
      "Dahanu",
      "Talasari",
      "Jawhar",
      "Mokhada",
      "Wada",
      "Vikramgad",
    ],
    "Mumbai Suburban": ["Andheri", "Bandra", "Borivali", "Kurla"],
    Ratnagiri: [
      "Ratnagiri",
      "Chiplun",
      "Guhagar",
      "Khed",
      "Lanja",
      "Mandangad",
      "Rajapur",
      "Sangameshwar",
    ],
    Raigad: [
      "Alibag",
      "Mahad",
      "Mhasala",
      "Murud",
      "Panvel",
      "Pen",
      "Roha",
      "Shrivardhan",
      "Sudhagad",
      "Uran",
    ],
    Sindhudurg: [
      "Kankavli",
      "Kudal",
      "Devgad",
      "Malvan",
      "Sawantwadi",
      "Vengurla",
      "Dodamarg",
      "Vaibhavwadi",
    ],
    Gadchiroli: [
      "Gadchiroli",
      "Armori",
      "Chamorshi",
      "Etapalli",
      "Kurkheda",
      "Aheri",
      "Bhamragad",
      "Desaiganj",
      "Mulchera",
      "Sironcha",
      "Wadsa",
    ],
    Gondia: [
      "Gondia",
      "Arjuni Morgaon",
      "Amgaon",
      "Deori",
      "Goregaon",
      "Salekasa",
      "Sadak Arjuni",
      "Tirora",
    ],
    Chandrapur: [
      "Chandrapur",
      "Ballarpur",
      "Bhadrawati",
      "Bramhapuri",
      "Chimur",
      "Gondpipari",
      "Jiwati",
      "Korpana",
      "Mul",
      "Nagbhid",
      "Rajura",
      "Sindewahi",
      "Saoli",
      "Warora",
    ],
    Nagpur: [
      "Nagpur",
      "Hingna",
      "Kamthi",
      "Katol",
      "Kuhi",
      "Mauda",
      "Narkhed",
      "Parshivni",
      "Ramtek",
      "Savner",
      "Umred",
      "Bhiwapur",
      "Kalmeshwar",
    ],
    Bhandara: [
      "Bhandara",
      "Lakhani",
      "Lakhandoor",
      "Mohadi",
      "Pavani",
      "Pauni",
      "Sakoli",
      "Tumsar",
    ],
    Wardha: [
      "Wardha",
      "Arvi",
      "Asgaon",
      "Deoli",
      "Hinganghat",
      "Karanja",
      "Samudrapur",
      "Selu",
    ],
    Ahmednagar: [
      "Ahmednagar",
      "Akole",
      "Kopargaon",
      "Newasa",
      "Parner",
      "Pathardi",
      "Rahata",
      "Rahuri",
      "Shrigonda",
      "Shrirampur",
      "Sangamner",
      "Shevgaon",
    ],
    Jalgaon: [
      "Jalgaon",
      "Amalner",
      "Bhadgaon",
      "Bhusawal",
      "Chalisgaon",
      "Dharangaon",
      "Erandol",
      "Jamner",
      "Muktainagar",
      "Pachora",
      "Raver",
      "Yawal",
    ],
    Dhule: ["Dhule", "Sakri", "Shirpur", "Sindkheda"],
    Nandurbar: [
      "Nandurbar",
      "Akkalkuwa",
      "Dhadgaon",
      "Navapur",
      "Shahada",
      "Taloda",
    ],
    Nashik: [
      "Nashik",
      "Baglan",
      "Chandwad",
      "Deola",
      "Igatpuri",
      "Kalwan",
      "Malegaon",
      "Nandgaon",
      "Niphad",
      "Pimpalgaon",
      "Sinnar",
      "Suragana",
      "Trimbakeshwar",
      "Yeola",
    ],
    Kolhapur: [
      "Kolhapur",
      "Ajra",
      "Bhudargad",
      "Chandgad",
      "Gadhinglaj",
      "Hatkanangle",
      "Kagal",
      "Karvir",
      "Panhala",
      "Radhanagari",
      "Shahuwadi",
      "Shirol",
    ],
    Pune: [
      "Pune",
      "Ambegaon",
      "Baramati",
      "Bhor",
      "Daund",
      "Haveli",
      "Indapur",
      "Junnar",
      "Khed",
      "Mulshi",
      "Purandar",
      "Shirur",
      "Velhe",
    ],
    Sangli: [
      "Sangli",
      "Atpadi",
      "Khanapur",
      "Kavathemahankal",
      "Jat",
      "Miraj",
      "Palus",
      "Shirala",
      "Tasgaon",
      "Valva",
    ],
    Satara: [
      "Satara",
      "Koregaon",
      "Khatav",
      "Khanapur",
      "Man",
      "Mahabaleshwar",
      "Patan",
      "Phaltan",
      "Wai",
      "Jawali",
      "Khandala",
    ],
    Solapur: [
      "Solapur",
      "Akkalkot",
      "Barshi",
      "Karmala",
      "Madha",
      "Malshiras",
      "Mohol",
      "Pandharpur",
      "Sangola",
      "Solapur North",
      "Solapur South",
    ],
  };

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      const data = {};
      for (const category of categories) {
        const res = await fetch(
          `http://localhost:3000/subcategories/category/${category.category_id}`
        );
        data[category.category_id] = res.ok ? await res.json() : [];
      }
      setSubcategories(data);
    };
    if (categories.length > 0) fetchSubcategories();
  }, [categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    let error = "";
    if (name === "name" && value && !isValidName(value)) {
      error = "Name must contain only letters and spaces.";
    } else if (name === "email" && value && !isValidEmail(value)) {
      error = "Please enter a valid email address.";
    } else if (name === "password" && value && !isValidPassword(value)) {
      error =
        "Password must include uppercase, lowercase, number, symbol (min 8 chars).";
    } else if (name === "phone" && value && !isValidPhone(value)) {
      error = "Phone must be exactly 10 digits and no letters.";
    } else if (name === "agreeToTerms" && !checked) {
      error = "You must agree to the Terms & Conditions.";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
      errors: {
        ...prev.errors,
        [name]: error,
      },
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024;

    let error = "";
    if (!allowedTypes.includes(file?.type)) {
      error = "Only PDF, JPG, or PNG allowed.";
    } else if (file?.size > maxSize) {
      error = "File exceeds 5MB.";
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  };

  const validateForm = () => {
    const { ok, errors: coreErrors } = validateRegistration(formData);
    let isValid = ok;

    const errors = {
      ...formData.errors,
      ...coreErrors,
    };

    if (!formData.aadharCard) {
      errors.aadharCard = "Aadhar Card is required";
      isValid = false;
    }
    if (!formData.panCard) {
      errors.panCard = "PAN Card is required";
      isValid = false;
    }
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the Terms.";
      isValid = false;
    }

    setFormData((prev) => ({ ...prev, errors }));
    return isValid;
  };

  const isFormValid = () => {
    return (
      formData.name &&
      isValidEmail(formData.email) &&
      isValidPassword(formData.password) &&
      isValidPhone(formData.phone) &&
      formData.address &&
      formData.district &&
      formData.taluka &&
      formData.aadharCard &&
      formData.panCard &&
      formData.profilePhoto &&
      formData.agreeToTerms &&
      Object.values(formData.errors).every((err) => !err)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return Swal.fire("Validation Error", "Please fix errors.", "error");
    }

    Swal.fire({
      title: "Processing…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payload = new FormData();

      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (
          [
            "aadharCard",
            "panCard",
            "profilePhoto",
            "errors",
            "agreeToTerms",
          ].includes(key)
        )
          return;
        if (value !== null && value !== undefined) {
          payload.append(key, value.toString());
        }
      });

      // Append documents
      payload.append("files", formData.aadharCard);
      payload.append("files", formData.panCard);
      payload.append("documentTypes", "Aadhar Card");
      payload.append("documentTypes", "PAN Card");

      // Append profile photo
      if (formData.profilePhoto) {
        payload.append("profilePhoto", formData.profilePhoto);
      }

      const res = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      Swal.close();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // SMS Logic
      const phoneE164 = formData.phone.startsWith("91")
        ? formData.phone
        : "91" + formData.phone;
      const message =
        `Welcome to Mazedakhale! Your registration was successful, *Wait For Admin Approval*.\n\n` +
        `Here are your login credentials:\n` +
        `Email: ${formData.email}\n` +
        `Password: ${formData.password}\n\n` +
        `Thank you for joining us!`;
      fetch(SMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: SMS_SENDER,
          number: phoneE164,
          message,
        }),
      }).catch(console.error);

      Swal.fire(
        "Success",
        "Registered successfully and SMS sent!",
        "success"
      ).then(() => navigate("/login"));
    } catch (err) {
      Swal.close();
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://web.edcrib.com/updates/wp-content/uploads/2024/08/edcrib-blog1-1024x683.jpeg')",
      }}
    >
      <div className="flex w-11/12 min-h-screen bg-white bg-opacity-90 rounded-lg shadow-xl gap-8 p-8 flex-col lg:flex-row">
        <div className="w-2/5 p-8 flex flex-col justify-center bg-white shadow-lg rounded-lg">
          <h2 className="text-xl text-[#F58A3B] font-bold mb-4 text-center">
            Register
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`w-full p-2 border rounded text-xs ${
                formData.errors.name
                  ? "border-red-500"
                  : isValidEmail(formData.email)
                  ? "border-green-500"
                  : ""
              }`}
              onChange={handleChange}
              required
            />
            {formData.errors.name && (
              <p className="text-xs text-red-600">{formData.errors.name}</p>
            )}

            {/* Email */}
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`w-full p-2 border rounded text-xs ${
                formData.errors.email
                  ? "border-red-500"
                  : isValidEmail(formData.email)
                  ? "border-green-500"
                  : ""
              }`}
              onChange={handleChange}
              required
            />
            {formData.errors.email && (
              <p className="text-xs text-red-600">{formData.errors.email}</p>
            )}

            {/* Phone + Password in one line */}
            <div className="flex space-x-4">
              {/* Password */}
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    className={`w-full p-2 border rounded text-xs pr-10 ${
                      formData.errors.password
                        ? "border-red-500"
                        : isValidPassword(formData.password)
                        ? "border-green-500"
                        : ""
                    }`}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={() => setPasswordVisible((p) => !p)}
                  >
                    {passwordVisible ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </button>
                </div>
                {formData.errors.password && (
                  <p className="text-xs text-red-600">
                    {formData.errors.password}
                  </p>
                )}
              </div>
              {/* Phone */}
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  className={`w-full p-2 border rounded text-xs ${
                    formData.errors.phone
                      ? "border-red-500"
                      : isValidPhone(formData.phone)
                      ? "border-green-500"
                      : ""
                  }`}
                  onChange={handleChange}
                  required
                />
                {formData.errors.phone && (
                  <p className="text-xs text-red-600">
                    {formData.errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Photo */}
            <div className="space-y-1 mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Profile Photo (Max 5MB)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, "profilePhoto")}
                className={`w-full p-2 border rounded text-xs ${
                  formData.errors.profilePhoto ? "border-red-500" : ""
                }`}
              />
              {formData.errors.profilePhoto && (
                <p className="text-xs text-red-600">
                  {formData.errors.profilePhoto}
                </p>
              )}
            </div>

            {/* Address + Shop Address */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className={`w-full p-2 border rounded text-xs ${
                    formData.errors.address ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Shop Address
                </label>
                <input
                  type="text"
                  name="shopAddress"
                  className="w-full p-2 border rounded text-xs"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* District + Taluka */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  District <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  className={`w-full p-2 border rounded text-xs ${
                    formData.errors.district ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Taluka <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="taluka"
                  className={`w-full p-2 border rounded text-xs ${
                    formData.errors.taluka ? "border-red-500" : ""
                  }`}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Aadhar + PAN */}
            <div className="flex space-x-4">
              {[
                { field: "aadharCard", label: "Aadhar Card (Max 5MB)" },
                { field: "panCard", label: "PAN Card (Max 5MB)" },
              ].map(({ field, label }) => (
                <div key={field} className="w-1/2 space-y-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {label} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, field)}
                    className={`w-full p-2 border rounded text-xs ${
                      formData.errors[field] ? "border-red-500" : ""
                    }`}
                    required
                  />
                  {formData.errors[field] && (
                    <p className="text-xs text-red-600">
                      {formData.errors[field]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Agree to Terms */}
            {/* Agree to Terms */}
            <div className="flex items-start mt-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className={`h-4 w-4 mt-1 text-[#F58A3B] rounded ${
                  formData.errors.agreeToTerms ? "border-red-500" : ""
                }`}
              />
              <label className="ml-2 text-xs text-gray-700">
                I agree to the{" "}
                <a
                  href="/PrivacyPolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F58A3B] hover:underline"
                >
                  Terms & Conditions
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full bg-[#F58A3B] text-white py-2 rounded text-xs ${
                !isFormValid()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#e07d35]"
              }`}
              disabled={!isFormValid()}
            >
              Register
            </button>
          </form>

          <p className="mt-4 text-center text-xs">
            Already have an account?{" "}
            <Link to="/" className="text-[#F58A3B] hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right Column - Category List */}
        <div className="w-3/5 p-8 bg-white shadow-lg border border-gray-200 overflow-y-auto max-h-[95vh] rounded-lg">
          <h2 className="text-xl text-[#F58A3B] font-bold mb-4 text-center">
            Government Document Services
          </h2>
          <ul className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <li
                key={category.category_id}
                className="text-gray-700 border-b pb-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-orange text-xs">⚫</span>
                  <span className="text-xs">{category.category_name}</span>
                </div>
                {subcategories[category.category_id]?.length > 0 && (
                  <ul className="ml-6 mt-2">
                    {subcategories[category.category_id]?.map((sub) => (
                      <li
                        key={sub.subcategory_id}
                        className="flex items-center space-x-2 text-gray-600"
                      >
                        <span className="text-gray-500 text-xs">●</span>
                        <span className="text-xs">{sub.subcategory_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Register;
