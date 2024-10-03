const PlanLog = require("../../model/planLog");

const planLogList = async (req, res) => {
    try {
        
        let { page = 1, limit = 10 } = req.query;
    
        page = parseInt(page);
        limit = parseInt(limit);
    
        const skip = (page - 1) * limit;
    
        
    
        // Use aggregate to get data for the current page and the total count of documents
        const [data, totalDocuments] = await Promise.all([
          PlanLog.aggregate([
            { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
            { $skip: skip },
            { $limit: limit }
          ]),
          PlanLog.countDocuments(), // Count documents based on the search query
        ]);
    
        // Calculate the number of documents on the current page
        const documentOnCurrentPage = data.length;
        res.status(200).json({
          error: false,
          data,
          page,
          limit,
          totalDocuments,
          documentOnCurrentPage,
          message: "Get all Influencer list successfully !!",
        });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ error: true, err: error, message: "Internal Server Error" });
      }
}

module.exports = {
    planLogList
}