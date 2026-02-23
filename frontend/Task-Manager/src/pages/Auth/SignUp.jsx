import React, { useState } from 'react'
import AuthLayout from "../../components/layouts/AuthLayout";
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import { Link } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths.js';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext.jsx';
import { useContext } from 'react';
import uploadImage from '../../utils/uploadImage.js';

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const {updateUser}=useContext(UserContext);
  const navigate = useNavigate();

  //handle SignUp form submit
  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";
    setError(null);
    setErrors([]);
    
    if (!fullName) {
      setError("Please enter fullname.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);

    //SignUp API Call
    try {
      //upload profile picture if selected
      if (profilePic) {
        const imgUploadRes=await uploadImage(profilePic);
        profileImageUrl=imgUploadRes.imageUrl||"";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
        name:fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });
        const {token,role}=response.data;
        if(token){
          localStorage.setItem("token",token);
          updateUser(response.data);
          //redirect based on role
          if(role?.toLowerCase()=== "admin"){
            navigate("/admin/dashboard");
          } 
          else if(role?.toLowerCase() === "member"){
            navigate("/user/dashboard");
          }
        }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if(errorData.errors && Array.isArray(errorData.errors)){
          setErrors(errorData.errors);
          setError("Please fix the following errors:");
        } else {
          setError(errorData.message || "Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">

        <h3 className="text-xl font-semibold text-black">
          Create an Account
        </h3>

        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join us today by entering your details below
        </p>

        <form onSubmit={handleSignUp}>

          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
              disabled={loading}
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="email"
              disabled={loading}
            />

            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              placeholder="Enter your password (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)"
              type="password"
              disabled={loading}
            />

            <Input
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder="6 Digit Code"
              type="text"
              disabled={loading}
            />

          </div>

          {error && (
            <div className="text-red-500 text-xs pb-2.5">
              <p>{error}</p>
              {errors.length > 0 && (
                <ul className="list-disc list-inside mt-2">
                  {errors.map((err, idx) => (
                    <li key={idx} className="mt-1">{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary underline"
              to="/login"
            >
              Login
            </Link>
          </p>

        </form>

      </div>
    </AuthLayout>
  )
}

export default SignUp