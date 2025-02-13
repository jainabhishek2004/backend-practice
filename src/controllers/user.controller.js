import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // if (!fullName) {
    //     throw new ApiError(400, "Full name is required");
    // }

    if(
        [fullName,email,username,password].some((field) =>
        field?.trim() === "")
    ) {
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    

    if(existedUser) {
        throw new ApiError(409,"User Already Existed")
    }
    
    console.log(req.files); // Log the files to see the structure

     
    const avatarlocalpath = req.files?.avatar[0]?.path;
    console.log( avatarlocalpath)
    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalpath = req.files.coverImage[0].path
    }
  

if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar file is required");
}


const avatar = await uploadOnCloudinary(avatarlocalpath);
const coverImage = await uploadOnCloudinary(coverImageLocalpath);

console.log(avatar);


    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

  const user =  await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

   const created_User =await  User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(! created_User){
    throw new ApiError(500, "Something went wrong while register the user")
   }
   
   return res.status(201).json(
    new ApiResponse(200, created_User,"User Registered Successfully")
   )

    



   
});

export { registerUser };