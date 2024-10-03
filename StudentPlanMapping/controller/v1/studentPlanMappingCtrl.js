const StudentPlan = require("../../models/studentPlanMappingModel");
const Plan = require("../../../Plan/models/PlanModel");

//Add Student Plan
const addStudentPlanMapping = async (req, res) => {
    try {
      const studentPlanData = req.body;
  
      // Create a new StudentPlan instance
      const newStudentPlan = new StudentPlan(studentPlanData);
  
      // Save the StudentPlan to the database
      const savedStudentPlan = await newStudentPlan.save();
  
      res.status(201).json({ message: 'Student plan added successfully', data: savedStudentPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//Get Student plan Based on id and Associated plan
const getStudentPlanDetails = async (req, res) => {
  const studentPlanId = req.params.id;

  try {
    const studentPlan = await StudentPlan.findById(studentPlanId);

    if (!studentPlan) {
      return res.status(404).json({ error: 'Student Plan not found' });
    }

    
    const associatedPlan = await Plan.findById(studentPlan.planId);

    if (!associatedPlan) {
      return res.status(404).json({ error: 'Associated Plan not found' });
    }

    
    const response = {
      studentPlan,
      associatedPlan,
    };

    res.status(200).json({
      message: 'Student plan and associated plan retrieved successfully',
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const getGeneralandCoursePlan = async (req, res) => {
  const { courseType, lsSaId, apId, label, lsSaRefId, name } = req.query;

  try {
    let plansQuery = { status: "Active" }; // Filter by status: 'Active'

    if (courseType) {
      plansQuery.courseType = courseType;
    }

    if (lsSaId) {
      plansQuery = {
        "courseInfo.lsSaId": lsSaId,
      };
    }

    if (apId) {
      plansQuery = {
        "courseInfo.apId": apId,
      };
    }

    if (label) {
      plansQuery = {
        "courseInfo.label": label,
      };
    }

    if (name) {
      plansQuery = {
        "channelInfo.name": name,
      };
    }

    if (lsSaRefId) {
      plansQuery = {
        "channelInfo.lsSaRefId": lsSaRefId,
      };
    }

    console.log("Query Parameters:", req.query);
    console.log("Constructed Plans Query:", plansQuery);

    const plans = await Plan.find(plansQuery);

    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ error: "No active plans found for the specified criteria" });
    }

    // Fetch student plans related to the fetched plans
    const studentPlans = await StudentPlan.find({
      planId: { $in: plans.map((plan) => plan._id) },
    });

    // Response structure with both active generalPlans and active coursePlans as arrays
    const response = {
      activeGeneralPlans: plans,
      activeCoursePlans: studentPlans,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
    addStudentPlanMapping,
    getStudentPlanDetails,
    getGeneralandCoursePlan
  };