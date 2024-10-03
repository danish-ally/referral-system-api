const axios = require("axios");

//Get Course
const getCourseByChannel = async (req, res) => {
  try {
    console.log(req.params);
    const channelId = req.params?.channelId;
    const base_url = process.env.BASE_URL_GATEWAY;
    const response = await axios.get(`${base_url}/api/${channelId}/course`);
    const data = response.data;
    // console.log(data)

    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};

//Get Package By Channel
const getPackageByChannel = async (req, res) => {
  try {
    const channelId = req.params?.channelId;
    const base_url = process.env.BASE_URL_GATEWAY;
    const response = await axios.get(`${base_url}/api/${channelId}/library`);
    const data = response.data;
    // console.log(data)

    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};

//Get Bootcamp By Channel
const getBootcampByChannel = async (req, res) => {
  try {
    const channelId = req.params?.channelId;
    const base_url = process.env.BASE_URL_GATEWAY;
    const response = await axios.get(`${base_url}/api/${channelId}/offer`);
    const data = response.data;
    // console.log(data)

    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};

//Course plan
const getCoursePlan = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const channelId = req.params?.channelId;
    const token = req.headers?.authorization;

    const base_url = process.env.BASE_URL_GATEWAY;

    const response = await axios.get(
      `${base_url}/api/${channelId}/coursePlan/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;
    // console.log(data)

    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};

//Get Package plan
const getPackagePlan = async (req, res) => {
  try {
    const packageId = req.params.packageId;
    const channelId = req.params?.channelId;
    const token = req.headers?.authorization;

    const base_url = process.env.BASE_URL_GATEWAY;

    const response = await axios.get(
      `${base_url}/api/${channelId}/libraryPlan/${packageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;
    // console.log(data)

    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};

//Get UserData From Lawsikho & Skillarbitrage
const getUserList = async (req, res) => {
  try {
    const token = req.headers?.authorization;
    const base_url = process.env.BASE_URL_GATEWAY;
    const channelId = req.params?.channelId;
    const status = req.query?.status;

    const response = await axios.get(`${base_url}/api/usersapi/get_users/${channelId}?status=${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    console.log(data, "filteredData")


    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};


//Get Student List
const getStudentList = async (req, res) => {
  console.log("uat")
  try {
    const token = req.headers?.authorization;
    const base_url = process.env.ASSIGNMENT_URL_GATEWAY;
    const second_base_url = process.env.SKILLARBITRAGE_URL;
    const channelId = req.params?.channelId;

    console.log("1")

    let endpoint;
    let selected_base_url;

    if (channelId == 1) {
      endpoint = '/api/v1/lawsikho/students-listing';
      selected_base_url = base_url;

      console.log("2")

    } else {
      endpoint = '/api/v1/skillarbitrage/students-listing';
      selected_base_url = second_base_url;
      console.log("3")

    }

    const search = req.query?.search;
    const offset = req.query?.offset;
    const limit = req.query?.limit;

    // Build query string
    let queryString = '';
    if (search) {
      queryString += `search=${search}&`;
    }
    if (offset) {
      queryString += `offset=${offset}&`;
    }
    if (limit) {
      queryString += `limit=${limit}&`;
    }


    console.log("4")
    // Remove trailing "&" if any
    queryString = queryString.slice(0, -1);


    console.log(`${selected_base_url}${endpoint}?${queryString}`)
    console.log(token)
    const response = await axios.get(`${selected_base_url}${endpoint}?${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log("response", response)
    const data = response.data;
    return res.json(data);
  } catch (error) {
    if (error.response?.status == 401) {
      return res.status(401).json({
        message: error.message,
        error: true,
        err: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        error: true,
        err: error.message,
      });
    }
  }
};

module.exports = {
  getCourseByChannel,
  getPackageByChannel,
  getBootcampByChannel,
  getCoursePlan,
  getPackagePlan,
  getUserList,
  getStudentList
};