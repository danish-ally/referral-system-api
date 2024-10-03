const ReferralLink = require("../../../referral-link/models/referralLink");
const ReferredStudent = require("../../models/referredStudent")




const create_referred_student = async (req, res) => {
    try {
        // Extract data from the request body
        const {
            studentDetails,
            channelInfo,
            planId,
            price,
            courseType,
            courseInfo,
            studentPlanId,
            referralLinkId
        } = req.body;

        // Create a new referred student instance
        const newReferredStudent = new ReferredStudent({
            studentDetails,
            channelInfo,
            planId,
            price,
            courseType,
            courseInfo,
            studentPlanId,
            referralLinkId
        });

        // Save the referred student to the database
        const createdReferredStudent = await newReferredStudent.save();

        res.json(createdReferredStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

function escapeRegExp(string) {
    // Escape special characters and trim leading/trailing spaces
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&").trim();
}


const list_of_referred_student = async (req, res) => {
    try {

        const referralCodes = await ReferredStudent.distinct('referralCode');

        console.log(referralCodes, "referralCodes");

        const referralLinkDetails = [];

        // Iterate over each referral code
        for (const code of referralCodes) {
            // Find the corresponding ReferralLink details for each code
            const linkDetails = await ReferralLink.findOne({ 'referralCode': code });

            if (linkDetails) {
                referralLinkDetails.push({
                    referralCode: code,
                    details: linkDetails.toObject(), // Convert to plain JavaScript object
                });
            }
        }

        // console.log(referralLinkDetails, "referralLinkDetails");

        // Assuming referralLinkDetails is an array with objects having details property
        const createdByDetails = referralLinkDetails.map(link => link.details.createdBy);

        // console.log(createdByDetails, "createdByDetails");

        console.log(req.user._id, "req.user.id");

        // Check if the user is an influencer
        if (req.user.role === 'influencer') {
            // Find the createdByDetail that matches with req.user.id
            const matchingCreatedByDetail = createdByDetails.find(detail => detail.id === req.user._id);

            console.log(matchingCreatedByDetail, "matchingCreatedByDetail");

            if (matchingCreatedByDetail == undefined) {
                res.status(200).json({
                    message: 'Data Fetched Successfully',
                    response: {
                        lawsikhoCount: 0,
                        skillarbitraCount: 0,
                        totalRegistered: 0,
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: 0,
                        limit: 0,
                        referredStudents: []
                    }
                });
            }


            if (matchingCreatedByDetail) {
                // Fetch the referralCode from ReferralLink model using the matched _id
                const matchingReferralLink = await ReferralLink.find({ 'createdBy.id': matchingCreatedByDetail?.id });

                console.log("matchingReferralLink length:", matchingReferralLink.length)

                if (matchingReferralLink) {
                    // Fetch the total count of referred students for pagination info


                    let lsSaRefId1Count = 0;
                    for (const referralLink of matchingReferralLink) {
                        const count = await ReferredStudent.countDocuments({
                            'referralCode': referralLink.referralCode,
                            'channelInfo.lsSaRefId': "1",
                        });
                        lsSaRefId1Count += count;
                    }


                    console.log("lsSaRefId1Count", lsSaRefId1Count)

                    let lsSaRefId2Count = 0;
                    for (const referralLink of matchingReferralLink) {
                        const count = await ReferredStudent.countDocuments({
                            'referralCode': referralLink.referralCode,
                            'channelInfo.lsSaRefId': "2",
                        });
                        lsSaRefId2Count += count;
                    }

                    console.log("lsSaRefId2Count", lsSaRefId2Count);

                    // Fetch total count of referred students
                    let totalCount = 0;
                    for (const referralLink of matchingReferralLink) {
                        const count = await ReferredStudent.countDocuments({
                            'referralCode': referralLink.referralCode
                        });
                        totalCount += count;
                    }


                    // Set default values for pagination
                    const page = parseInt(req.query.page) || 1;
                    const limit = parseInt(req.query.limit) || 10;
                    const skip = (page - 1) * limit;

                    // Construct the search query based on filters
                    const searchQuery = {};
                    if (req.query.search) {
                        const referralCodes = matchingReferralLink.map(link => link.referralCode);
                        searchQuery['$or'] = [
                            { 'studentDetails.name': { $regex: req.query.search, $options: 'i' } },
                            // Add more conditions for other details as needed
                        ];
                        // Adding the referral codes to the search query
                        searchQuery['$or'].push({ 'referralCode': { $in: referralCodes } });
                    } else {
                        const referralCodes = matchingReferralLink.map(link => link.referralCode);
                        searchQuery['referralCode'] = { $in: referralCodes };
                    }

                    // Add filter conditions
                    if (req.query.planId) {
                        searchQuery['planId'] = req.query.planId;
                    }

                    if (req.query.courseType) {
                        searchQuery['courseType'] = { $regex: new RegExp(escapeRegExp(req.query.courseType), 'i') };
                    }

                    if (req.query.studentPlanId) {
                        searchQuery['studentPlanId'] = req.query.studentPlanId;
                    }

                    if (req.query.channelId) {
                        searchQuery['channelInfo.lsSaRefId'] = req.query.channelId;
                    }

                    // Check for date range in createdAt
                    if (req.query.fromDate && req.query.toDate) {
                        const fromDate = new Date(req.query.fromDate);
                        const toDate = new Date(req.query.toDate);

                        // If fromDate and toDate are both set to today, include today's data
                        if (isSameDate(fromDate, toDate) && isSameDate(fromDate, new Date())) {
                            const todayStart = new Date();
                            todayStart.setHours(0, 0, 0, 0);

                            const todayEnd = new Date();
                            todayEnd.setHours(23, 59, 59, 999);

                            searchQuery.createdAt = {
                                $gte: todayStart,
                                $lte: todayEnd,
                            };
                        } else {
                            searchQuery.createdAt = {
                                $gte: fromDate,
                                $lte: new Date(toDate.getTime() + 86399000), // Adjust the toDate to the end of the day
                            };
                        }
                    }

                    // Helper function to check if two dates are on the same day
                    function isSameDate(date1, date2) {
                        return (
                            date1.getDate() === date2.getDate() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getFullYear() === date2.getFullYear()
                        );
                    }

                    // Fetch referred students based on the search query, sort, and pagination parameters
                    const referredStudents = await ReferredStudent.find(searchQuery)
                        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
                        .skip(skip)
                        .limit(limit)
                        .exec();

                    // Create the response object with referred students and pagination info
                    const response = {
                        currentPage: page,
                        limit: limit,
                        totalItems: totalCount,
                        totalPages: Math.ceil(totalCount / limit),
                        lawsikhoCount: lsSaRefId1Count,
                        skillarbitraCount: lsSaRefId2Count,
                        totalRegistered: lsSaRefId1Count + lsSaRefId2Count,
                        referredStudents: referredStudents.map(student => ({
                            studentDetails: {
                                name: student.studentDetails.name,
                                channelInfo: student.channelInfo,
                            }
                        }))
                    };

                    // Send the response
                    res.status(200).json({ message: 'Data Fetched Successfully', response });
                }
            }
        } else {
            // Extract filters from query parameters
            const filters = req.query;

            // Set default values for pagination
            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const skip = (page - 1) * limit;

            // Construct the query based on filters
            const query = {};
            // Add search condition for multiple details
            if (filters.search) {
                query['$or'] = [
                    { 'studentDetails.name': { $regex: filters.search, $options: 'i' } },
                    { 'studentDetails.email': { $regex: filters.search, $options: 'i' } },
                    {
                        "studentDetails.consolidatedPhoneNo": {
                            $regex: new RegExp(escapeRegExp(filters.search), "i"),
                        },
                    },
                    {
                        "price.originalPrice": {
                            $regex: new RegExp(escapeRegExp(filters.search), "i"),
                        },
                    },
                    {
                        "price.discountPrice": {
                            $regex: new RegExp(escapeRegExp(filters.search), "i"),
                        },
                    },
                    { courseType: { $regex: filters.search, $options: 'i' } },
                    {
                        "courseType.lsSaId": {
                            $regex: new RegExp(escapeRegExp(filters.search), "i"),
                        },
                    },
                    {
                        "courseType.apId": {
                            $regex: new RegExp(escapeRegExp(filters.search), "i"),
                        },
                    },
                    {
                        "courseType.label": {
                            $regex: new RegExp(escapeRegExp(filters.search), "i"),
                        },
                    }
                    // Add more conditions for other details as needed
                ];
            }
            if (filters.planId) {
                query.planId = filters.planId;
            }
            if (filters.courseType) {
                query['courseType'] = { $regex: new RegExp(escapeRegExp(filters.courseType), 'i') };
            }
            if (filters.studentPlanId) {
                query.studentPlanId = filters.studentPlanId;
            }
            if (filters.channelId) {
                query['channelInfo.lsSaRefId'] = filters.channelId
            }

            //Daterange Filter
            if (filters.fromDate && filters.toDate) {
                const fromDate = new Date(filters.fromDate);
                const toDate = new Date(filters.toDate);

                if (isSameDate(fromDate, toDate) && isSameDate(fromDate, new Date())) {
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);

                    const todayEnd = new Date();
                    todayEnd.setHours(23, 59, 59, 999);

                    query.createdAt = {
                        $gte: todayStart,
                        $lte: todayEnd,
                    };
                } else {
                    query.createdAt = {
                        $gte: fromDate,
                        $lte: new Date(toDate.getTime() + 86399000),
                    };
                }
            }

            function isSameDate(date1, date2) {
                return (
                    date1.getDate() === date2.getDate() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getFullYear() === date2.getFullYear()
                );
            }

            // Add more filters as needed for other fields
            console.log("query:", query)

            // Fetch the total count of referred students for pagination info
            const count = await ReferredStudent.countDocuments(query);

            // Fetch the total count of students with lsSaRefId 1 inside channelInfo
            const lsSaRefId1Count = await ReferredStudent.countDocuments({
                ...query,
                'channelInfo.lsSaRefId': "1",
            });
            console.log(lsSaRefId1Count)

            // Fetch the total count of students with lsSaRefId 2 inside channelInfo
            const lsSaRefId2Count = await ReferredStudent.countDocuments({
                ...query,
                'channelInfo.lsSaRefId': "2",
            });

            // Fetch the referred students based on the query, sort, and pagination parameters
            const referredStudents = await ReferredStudent.find(query)
                .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
                .skip(skip)
                .limit(limit)
                .exec();

            // Fetch referralLink details for each referred student
            const referredStudentsWithReferralLinks = await Promise.all(
                referredStudents.map(async (student) => {
                    const referralLinkId = student.referralLinkId;

                    // Fetch referralLink details
                    const referralLinkDetails = await ReferralLink.findOne({
                        _id: referralLinkId,
                    });

                    // Merge referralLinkDetails with the student data
                    return {
                        ...student.toObject(),
                        referralLinkDetails,
                    };
                })
            );

            // Create the response object
            const response = {
                lawsikhoCount: lsSaRefId1Count,
                skillarbitraCount: lsSaRefId2Count,
                totalRegistered: lsSaRefId1Count + lsSaRefId2Count,
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit: limit,
                referredStudents: referredStudentsWithReferralLinks,
            };

            // Send the response
            res.status(200).json({ message: 'Data Fetched Successfully', response });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};





const list_of_referred_student_basedon_Influencer = async (req, res) => {
    try {
        console.log(req.user, "11111111");

        const referralCodes = await ReferredStudent.distinct('referralCode');

        console.log(referralCodes, "referralCodes");

        const referralLinkDetails = [];

        // Iterate over each referral code
        for (const code of referralCodes) {
            // Find the corresponding ReferralLink details for each code
            const linkDetails = await ReferralLink.findOne({ 'referralCode': code });

            if (linkDetails) {
                referralLinkDetails.push({
                    referralCode: code,
                    details: linkDetails.toObject(), // Convert to plain JavaScript object
                });
            }
        }

        console.log(referralLinkDetails, "referralLinkDetails");

        // Assuming referralLinkDetails is an array with objects having details property
        const createdByDetails = referralLinkDetails.map(link => link.details.createdBy);

        console.log(createdByDetails, "createdByDetails");

        console.log(req.user._id, "req.user.id");

        // Check if the user role is 'influencer'
        if (req.user.role === 'influencer') {
            // Find the createdByDetail that matches with req.user.id
            const matchingCreatedByDetail = createdByDetails.find(detail => detail.id === req.user._id);

            console.log(matchingCreatedByDetail, "matchingCreatedByDetail");

            if (matchingCreatedByDetail) {
                // Fetch the referralCode from ReferralLink model using the matched _id
                const matchingReferralLink = await ReferralLink.findOne({ 'createdBy.id': matchingCreatedByDetail.id });

                if (matchingReferralLink) {
                    console.log('Matching ReferralLink Details:', matchingReferralLink.toObject());
                    console.log('Referral Code:', matchingReferralLink.referralCode);




                    // Fetch the total count of students with lsSaRefId 1 inside channelInfo
                    const lsSaRefId1Count = await ReferredStudent.countDocuments({
                        'referralCode': matchingReferralLink.referralCode,
                        'channelInfo.lsSaRefId': "1",
                    });
                    console.log(lsSaRefId1Count)

                    // Fetch the total count of students with lsSaRefId 2 inside channelInfo
                    const lsSaRefId2Count = await ReferredStudent.countDocuments({
                        'referralCode': matchingReferralLink.referralCode,
                        'channelInfo.lsSaRefId': "2",
                    });

                    console.log(lsSaRefId2Count)

                    // Fetch total count of referred students
                    const totalCount = await ReferredStudent.countDocuments({ 'referralCode': matchingReferralLink.referralCode });

                    // Set default values for pagination
                    const page = parseInt(req.query.page) || 1;
                    const limit = parseInt(req.query.limit) || 10;
                    const skip = (page - 1) * limit;

                    // Construct the search query based on filters
                    const searchQuery = { 'referralCode': matchingReferralLink.referralCode };
                    if (req.query.search) {
                        searchQuery['$or'] = [
                            { 'studentDetails.name': { $regex: req.query.search, $options: 'i' } },
                        ];
                    }

                    // Add filter conditions
                    if (req.query.planId) {
                        searchQuery['planId'] = req.query.planId;
                    }

                    if (req.query.courseType) {
                        searchQuery['courseType'] = { $regex: new RegExp(escapeRegExp(req.query.courseType), 'i') };
                    }

                    if (req.query.studentPlanId) {
                        searchQuery['studentPlanId'] = req.query.studentPlanId;
                    }

                    if (req.query.channelId) {
                        searchQuery['channelInfo.lsSaRefId'] = req.query.channelId;
                    }

                    // Check for date range in createdAt
                    if (req.query.fromDate && req.query.toDate) {
                        const fromDate = new Date(req.query.fromDate);
                        const toDate = new Date(req.query.toDate);

                        // If fromDate and toDate are both set to today, include today's data
                        if (isSameDate(fromDate, toDate) && isSameDate(fromDate, new Date())) {
                            const todayStart = new Date();
                            todayStart.setHours(0, 0, 0, 0);

                            const todayEnd = new Date();
                            todayEnd.setHours(23, 59, 59, 999);

                            searchQuery.createdAt = {
                                $gte: todayStart,
                                $lte: todayEnd,
                            };
                        } else {
                            searchQuery.createdAt = {
                                $gte: fromDate,
                                $lte: new Date(toDate.getTime() + 86399000), // Adjust the toDate to the end of the day
                            };
                        }
                    }

                    // Helper function to check if two dates are on the same day
                    function isSameDate(date1, date2) {
                        return (
                            date1.getDate() === date2.getDate() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getFullYear() === date2.getFullYear()
                        );
                    }

                    // Fetch referred students based on the search query, sort, and pagination parameters
                    const referredStudents = await ReferredStudent.find(searchQuery)
                        .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest first)
                        .skip(skip)
                        .limit(limit)
                        .exec();

                    // Create the response object with referred students and pagination info
                    const response = {
                        currentPage: page,
                        limit: limit,
                        totalItems: totalCount,
                        totalPages: Math.ceil(totalCount / limit),
                        lawsikhoCount: lsSaRefId1Count,
                        skillarbitraCount: lsSaRefId2Count,
                        totalRegistered: lsSaRefId1Count + lsSaRefId2Count,
                        referredStudents: referredStudents.map(student => ({
                            studentDetails: {
                                name: student.studentDetails.name,
                            }
                        }))
                    };

                    // Send the response
                    res.json(response);
                }
            } else {
                // Handle the case when the user is not an influencer
                res.status(403).json({ message: 'Forbidden: Access Denied' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}














module.exports = {
    create_referred_student,
    list_of_referred_student,
    list_of_referred_student_basedon_Influencer
}