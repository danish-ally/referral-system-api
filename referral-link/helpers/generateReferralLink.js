
const generate_referral_link = async (channelInfo, courseInfo, urlSegment, referralCode, courseType) => {

  console.log("courseType value from generate_referral_link function is: ", courseType)
  try {
    let referralLink;
    const base_url = process.env.LAWSIKHO_URL;
    const base_url_courses = process.env.LAWSIKHO_COURSES_URL;
    const second_base_url = process.env.SKILLARBITRAGE_GENERATE_URL;
    const second_base_url_courses = process.env.SKILLARBITRAGE_COURSES_GENERATE_URL

    const lawsikho_base_url_for_offers = process.env.LAWSIKHO_URL_FOR_OFFERS
    const skillerbitra_base_url_for_offers = process.env.SKILLARBITRAGE_GENERATE_URL_FOR_OFFERS

    if (channelInfo?.lsSaRefId) {

      if (channelInfo.lsSaRefId === "1") {
        if (courseInfo) {
          console.log("i am working")

          if (courseType == "standalone" || courseType == "package") {
            const urlSegmentOfPlan = urlSegment || "";
            console.log(urlSegmentOfPlan, "urlSegmentOfPlan")
            const myReferralCode = referralCode || "";
            referralLink = `${base_url}/${urlSegmentOfPlan}?referralCode=${myReferralCode}`;
          } else {
            const urlSegmentOfPlan = urlSegment || "";
            console.log(urlSegmentOfPlan, "urlSegmentOfPlan")
            const myReferralCode = referralCode || "";
            referralLink = `${lawsikho_base_url_for_offers}/${urlSegmentOfPlan}?referralCode=${myReferralCode}`;
          }

        } else {
          if (courseType == "standalone" || courseType == "package") {
            const myReferralCode = referralCode || "";
            referralLink = `${base_url_courses}?referralCode=${myReferralCode}`;
          } else {
            const myReferralCode = referralCode || "";
            referralLink = `${lawsikho_base_url_for_offers}?referralCode=${myReferralCode}`;
          }
        }
      } else if (channelInfo.lsSaRefId === "2") {
        if (courseInfo) {

          if (courseType == "standalone" || courseType == "package") {
            const urlSegmentOfPlan = urlSegment || "";
            const myReferralCode = referralCode || "";
            referralLink = `${second_base_url}/${urlSegmentOfPlan}?referralCode=${myReferralCode}`;
          } else {
            const urlSegmentOfPlan = urlSegment || "";
            const myReferralCode = referralCode || "";
            referralLink = `${skillerbitra_base_url_for_offers}/${urlSegmentOfPlan}?referralCode=${myReferralCode}`;
          }
        } else {

          if (courseType == "standalone" || courseType == "package") {
            const myReferralCode = referralCode || "";
            referralLink = `${second_base_url_courses}?referralCode=${myReferralCode}`;
          } else {
            const myReferralCode = referralCode || "";
            referralLink = `${skillerbitra_base_url_for_offers}?referralCode=${myReferralCode}`;
          }
        }
      }
    }


    return {
      message: "Link generated successfully",
      referralLink,
    };
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Internal server error.");
  }
};

module.exports = generate_referral_link