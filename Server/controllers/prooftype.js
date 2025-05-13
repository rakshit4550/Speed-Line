// import Proof from "../models/Proof.js";
// import { whitelabel } from "../models/WhiteLabel.js";

// export const getProofByType = async (req, res) => {
//   try {
//     const user = req.query.user;
//     const proofType = req.params.type;
//     if (!user) {
//       return res.status(400).json({ message: "User parameter is required" });
//     }

//     const userExists = await whitelabel.findOne({ user });
//     if (!userExists) {
//       console.log(`User ${user} not found in whitelabel`);
//       return res
//         .status(400)
//         .json({ message: "Invalid user: User not found in whitelabel" });
//     }

//     console.log(`Querying proof for type: ${proofType}, user: ${user}`);
//     let proof = await Proof.findOne({
//       type: { $regex: new RegExp(`^${proofType}$`, "i") },
//       user,
//     });

//     if (!proof) {
//       console.log(
//         `Proof type ${proofType} not found for user ${user}. Creating new proof.`
//       );
//       const defaultContents = {
//         "Technical Malfunction": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Greetings from the Risk Management Team.</h2>
//   <h2 className="pb-[10px]">
//     Upon reviewing recent activity, we noticed a set of customer transactions that display an irregular profit spike.
//     The review indicates betting patterns where customers consistently hedge within seconds, often on sharp odds movement.
//     In such cases, these will be considered as odds manipulating or odds hedging.
//   </h2>
//   <h2>
//     <strong>Transaction IDs with timestamps</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> Taking proactive steps by flagging and voiding such transactions helps in safeguarding platform integrity.
//     It also assures genuine users that fair play is always prioritized.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   We appreciate your support in maintaining a safe betting ecosystem.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//         "Odds Manipulating Or Odds Hedging": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Trust this message finds you well.</h2>
//   <h2 className="pb-[10px]">
//     We have come across user accounts where the betting activity shows unusual behavior,
//     such as placing multiple counter bets in under a minute across volatile markets.
//     Based on our internal policy, such activity is classified as risk policy breach due to rapid-fire hedging.
//   </h2>
//   <h2>
//     <strong>Impacted Markets and Stake Amounts</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> In accordance with fair use terms, these bets will be voided to ensure no exploitation of technical or market loopholes.
//     Our responsibility is to ensure that the platform is used ethically by all parties.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   Thank you for your continued cooperation and understanding.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//         "Live Line and Ground Line": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Warm greetings from our side.</h2>
//   <h2 className="pb-[10px]">
//     We have recently detected a set of bets placed under similar timing and pattern, likely intended to leverage
//     a gap in real-time odds fluctuation. Upon evaluation with our risk protocols, we consider this an act of market manipulation or exploitative behavior.
//   </h2>
//   <h2>
//     <strong>Matched Bets & Customer Details</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> We are voiding the concerned bets as per compliance norms.
//     This action is crucial to preserve platform fairness and prevent recurrence of such cases.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   We hope for your understanding and collaborative approach on this matter.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//         "Live Line Betting": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Hope you are doing well.</h2>
//   <h2 className="pb-[10px]">
//     We have checked your customers profit and loss, which is unexpected.
//     After further consultation with the Risk team, The customers bets
//     are back and lay in the same minute, in such cases all such bets of
//     the customer will be treated as invalid.
//   </h2>
//   <h2>
//     <strong>Reference IDs with the amount</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> By voiding the bets of customers who have placed
//     bets with the same pattern, we can ensure a fair and unbiased
//     betting experience for all. Let's take a step towards a more
//     transparent and trustworthy system by eliminating any potential for
//     unfair advantages. Voiding these bets will promote integrity and
//     prove our commitment to providing a safe and enjoyable experience to
//     all our customers.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   Hope you can understand the situation better and we welcome your
//   positive approach.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//       };
//       const defaultContent =
//         defaultContents[proofType] || `Default content for ${proofType}...`;
//       proof = await Proof.create({
//         type: proofType,
//         content: defaultContent,
//         notes: "",
//         user,
//       });
//       console.log(`Created new proof for type ${proofType}, user ${user}`);
//     }

//     res.json({
//       type: proof.type,
//       content: proof.content,
//       notes: proof.notes,
//       user: proof.user,
//     });
//   } catch (error) {
//     console.error(
//       `Error in getProofByType for type ${req.params.type}, user ${req.query.user}:`,
//       error
//     );
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getAllProofs = async (req, res) => {
//   try {
//     const user = req.query.user;
//     if (!user) {
//       return res.status(400).json({ message: "User parameter is required" });
//     }

//     const userExists = await whitelabel.findOne({ user });
//     if (!userExists) {
//       console.log(`User ${user} not found in whitelabel`);
//       return res
//         .status(400)
//         .json({ message: "Invalid user: User not found in whitelabel" });
//     }

//     const proofs = await Proof.find({ user });
//     console.log(`Found ${proofs.length} proofs for user ${user}`);
//     res.json(proofs);
//   } catch (error) {
//     console.error(`Error in getAllProofs for user ${req.query.user}:`, error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const updateProofContent = async (req, res) => {
//   try {
//     const { notes } = req.body;
//     const user = req.query.user;
//     const proofType = req.params.type;

//     if (!user) {
//       return res.status(400).json({ message: "User parameter is required" });
//     }

//     const validProofTypes = [
//       "Technical Malfunction",
//       "Odds Manipulating Or Odds Hedging",
//       "Live Line and Ground Line",
//       "Live Line Betting",
//     ];
//     if (!validProofTypes.includes(proofType)) {
//       return res.status(400).json({ message: "Invalid proof type" });
//     }

//     if (!notes && notes !== "") {
//       return res.status(400).json({ message: "Valid notes are required" });
//     }

//     let proof = await Proof.findOne({
//       type: { $regex: new RegExp(`^${proofType}$`, "i") },
//       user,
//     });

//     if (!proof) {
//       console.log(
//         `Proof type ${proofType} not found for user ${user}. Creating new proof.`
//       );
//       const defaultContents = {
//         "Technical Malfunction": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Greetings from the Risk Management Team.</h2>
//   <h2 className="pb-[10px]">
//     Upon reviewing recent activity, we noticed a set of customer transactions that display an irregular profit spike.
//     The review indicates betting patterns where customers consistently hedge within seconds, often on sharp odds movement.
//     In such cases, these will be considered as odds manipulating or odds hedging.
//   </h2>
//   <h2>
//     <strong>Transaction IDs with timestamps</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> Taking proactive steps by flagging and voiding such transactions helps in safeguarding platform integrity.
//     It also assures genuine users that fair play is always prioritized.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   We appreciate your support in maintaining a safe betting ecosystem.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//         "Odds Manipulating Or Odds Hedging": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Trust this message finds you well.</h2>
//   <h2 className="pb-[10px]">
//     We have come across user accounts where the betting activity shows unusual behavior,
//     such as placing multiple counter bets in under a minute across volatile markets.
//     Based on our internal policy, such activity is classified as risk policy breach due to rapid-fire hedging.
//   </h2>
//   <h2>
//     <strong>Impacted Markets and Stake Amounts</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> In accordance with fair use terms, these bets will be voided to ensure no exploitation of technical or market loopholes.
//     Our responsibility is to ensure that the platform is used ethically by all parties.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   Thank you for your continued cooperation and understanding.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//         "Live Line and Ground Line": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Warm greetings from our side.</h2>
//   <h2 className="pb-[10px]">
//     We have recently detected a set of bets placed under similar timing and pattern, likely intended to leverage
//     a gap in real-time odds fluctuation. Upon evaluation with our risk protocols, we consider this an act of market manipulation or exploitative behavior.
//   </h2>
//   <h2>
//     <strong>Matched Bets & Customer Details</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> We are voiding the concerned bets as per compliance norms.
//     This action is crucial to preserve platform fairness and prevent recurrence of such cases.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   We hope for your understanding and collaborative approach on this matter.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//         "Live Line Betting": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Hope you are doing well.</h2>
//   <h2 className="pb-[10px]">
//     We have checked your customers profit and loss, which is unexpected.
//     After further consultation with the Risk team, The customers bets
//     are back and lay in the same minute, in such cases all such bets of
//     the customer will be treated as invalid.
//   </h2>
//   <h2>
//     <strong>Reference IDs with the amount</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> By voiding the bets of customers who have placed
//     bets with the same pattern, we can ensure a fair and unbiased
//     betting experience for all. Let's take a step towards a more
//     transparent and trustworthy system by eliminating any potential for
//     unfair advantages. Voiding these bets will promote integrity and
//     prove our commitment to providing a safe and enjoyable experience to
//     all our customers.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   Hope you can understand the situation better and we welcome your
//   positive approach.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//       };
//       proof = await Proof.create({
//         type: proofType,
//         content:
//           defaultContents[proofType] || `Default content for ${proofType}...`,
//         notes: notes ? notes.trim() : "",
//         user,
//       });
//       console.log(`Created new proof for type ${proofType}, user ${user}`);
//     } else {
//       proof = await Proof.findOneAndUpdate(
//         { type: { $regex: new RegExp(`^${proofType}$`, "i") }, user },
//         { notes: notes ? notes.trim() : "" },
//         { new: true, writeConcern: { w: "majority" } }
//       );
//     }

//     if (!proof) {
//       console.log(
//         `Failed to update or create proof type ${proofType} for user ${user}`
//       );
//       return res
//         .status(500)
//         .json({ message: "Failed to update or create proof" });
//     }

//     res.json({ message: "Notes updated successfully", proof });
//   } catch (error) {
//     console.error(
//       `Error in updateProofContent for type ${req.params.type}, user ${req.query.user}:`,
//       error
//     );
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const deleteProof = async (req, res) => {
//   try {
//     const user = req.query.user;
//     const proofType = req.params.type;

//     if (!user) {
//       return res.status(400).json({ message: "User parameter is required" });
//     }

//     const proof = await Proof.findOneAndDelete({
//       type: { $regex: new RegExp(`^${proofType}$`, "i") },
//       user,
//     });

//     if (!proof) {
//       return res.status(404).json({ message: "Proof not found" });
//     }

//     console.log(`Deleted proof for type ${proofType}, user ${user}`);
//     res.json({ message: "Proof deleted successfully" });
//   } catch (error) {
//     console.error(
//       `Error in deleteProof for type ${req.params.type}, user ${req.query.user}:`,
//       error
//     );
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const initializeProofs = async () => {
//   try {
//     const whitelabels = await whitelabel.find().select("user");

//     if (!whitelabels.length) {
//       console.log("No whitelabel users found for proof initialization");
//       return;
//     }

//     const proofTypes = [
//       {
//         type: "Technical Malfunction",
//         content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Greetings from the Risk Management Team.</h2>
//   <h2 className="pb-[10px]">
//     Upon reviewing recent activity, we noticed a set of customer transactions that display an irregular profit spike.
//     The review indicates betting patterns where customers consistently hedge within seconds, often on sharp odds movement.
//     In such cases, these will be considered as odds manipulating or odds hedging.
//   </h2>
//   <h2>
//     <strong>Transaction IDs with timestamps</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> Taking proactive steps by flagging and voiding such transactions helps in safeguarding platform integrity.
//     It also assures genuine users that fair play is always prioritized.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   We appreciate your support in maintaining a safe betting ecosystem.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//       },
//       {
//         type: "Odds Manipulating Or Odds Hedging",
//         content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Trust this message finds you well.</h2>
//   <h2 className="pb-[10px]">
//     We have come across user accounts where the betting activity shows unusual behavior,
//     such as placing multiple counter bets in under a minute across volatile markets.
//     Based on our internal policy, such activity is classified as risk policy breach due to rapid-fire hedging.
//   </h2>
//   <h2>
//     <strong>Impacted Markets and Stake Amounts</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> In accordance with fair use terms, these bets will be voided to ensure no exploitation of technical or market loopholes.
//     Our responsibility is to ensure that the platform is used ethically by all parties.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   Thank you for your continued cooperation and understanding.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//       },
//       {
//         type: "Live Line and Ground Line",
//         content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Warm greetings from our side.</h2>
//   <h2 className="pb-[10px]">
//     We have recently detected a set of bets placed under similar timing and pattern, likely intended to leverage
//     a gap in real-time odds fluctuation. Upon evaluation with our risk protocols, we consider this an act of market manipulation or exploitative behavior.
//   </h2>
//   <h2>
//     <strong>Matched Bets & Customer Details</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> We are voiding the concerned bets as per compliance norms.
//     This action is crucial to preserve platform fairness and prevent recurrence of such cases.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   We hope for your understanding and collaborative approach on this matter.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//       },
//       {
//         type: "Live Line Betting",
//         content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
//   <h2 className="pb-[3px]">Dear Merchant,</h2>
//   <h2 className="pb-[10px]">Hope you are doing well.</h2>
//   <h2 className="pb-[10px]">
//     We have checked your customers profit and loss, which is unexpected.
//     After further consultation with the Risk team, The customers bets
//     are back and lay in the same minute, in such cases all such bets of
//     the customer will be treated as invalid.
//   </h2>
//   <h2>
//     <strong>Reference IDs with the amount</strong>
//   </h2>
// </div>
// <div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
//   <h2>
//     <strong>Conclusion:</strong> By voiding the bets of customers who have placed
//     bets with the same pattern, we can ensure a fair and unbiased
//     betting experience for all. Let's take a step towards a more
//     transparent and trustworthy system by eliminating any potential for
//     unfair advantages. Voiding these bets will promote integrity and
//     prove our commitment to providing a safe and enjoyable experience to
//     all our customers.
//   </h2>
// </div>
// <h2 className="pb-[3px]">
//   Hope you can understand the situation better and we welcome your
//   positive approach.
// </h2>
// <h2>Regards,</h2>
// <h2 className="pb-[7px]">
//   <strong>Risk Team.</strong>
// </h2>`,
//       },
//     ];

//     for (const wl of whitelabels) {
//       for (const proof of proofTypes) {
//         const exists = await Proof.findOne({
//           type: proof.type,
//           user: wl.user,
//         });
//         if (!exists) {
//           await Proof.create({
//             ...proof,
//             user: wl.user,
//           });
//           console.log(`Initialized proof ${proof.type} for user ${wl.user}`);
//         } else {
//           console.log(`Proof ${proof.type} already exists for user ${wl.user}`);
//         }
//       }
//     }
//     console.log("Proof initialization completed");
//   } catch (error) {
//     console.error("Error in initializeProofs:", error);
//   }
// };

import Proof from "../models/Proof.js";
import { whitelabel } from "../models/WhiteLabel.js";

export const getProofByType = async (req, res) => {
  try {
    const user = req.query.user;
    const proofType = req.params.type;
    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    const userExists = await whitelabel.findOne({ user });
    if (!userExists) {
      console.log(`User ${user} not found in whitelabel`);
      return res
        .status(400)
        .json({ message: "Invalid user: User not found in whitelabel" });
    }

    console.log(`Querying proof for type: ${proofType}, user: ${user}`);
    let proof = await Proof.findOne({
      type: { $regex: new RegExp(`^${proofType}$`, "i") },
      user,
    });

    if (!proof) {
      console.log(
        `Proof type ${proofType} not found for user ${user}. Creating new proof.`
      );
      const defaultContents = {
        "Technical Malfunction": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Greetings from the Risk Management Team.</h2>
  <h2 className="pb-[10px]">
    Upon reviewing recent activity, we noticed a set of customer transactions that display an irregular profit spike.
    The review indicates betting patterns where customers consistently hedge within seconds, often on sharp odds movement. 
    In such cases, these will be considered as odds manipulating or odds hedging.
  </h2>
  <h2>
    <strong>Transaction IDs with timestamps</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> Taking proactive steps by flagging and voiding such transactions helps in safeguarding platform integrity.
    It also assures genuine users that fair play is always prioritized.
  </h2>
</div>
<h2 className="pb-[3px]">
  We appreciate your support in maintaining a safe betting ecosystem.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
        "Odds Manipulating Or Odds Hedging": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Trust this message finds you well.</h2>
  <h2 className="pb-[10px]">
    We have come across user accounts where the betting activity shows unusual behavior, 
    such as placing multiple counter bets in under a minute across volatile markets.
    Based on our internal policy, such activity is classified as risk policy breach due to rapid-fire hedging.
  </h2>
  <h2>
    <strong>Impacted Markets and Stake Amounts</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> In accordance with fair use terms, these bets will be voided to ensure no exploitation of technical or market loopholes.
    Our responsibility is to ensure that the platform is used ethically by all parties.
  </h2>
</div>
<h2 className="pb-[3px]">
  Thank you for your continued cooperation and understanding.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
        "Live Line and Ground Line": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Warm greetings from our side.</h2>
  <h2 className="pb-[10px]">
    We have recently detected a set of bets placed under similar timing and pattern, likely intended to leverage 
    a gap in real-time odds fluctuation. Upon evaluation with our risk protocols, we consider this an act of market manipulation or exploitative behavior.
  </h2>
  <h2>
    <strong>Matched Bets & Customer Details</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> We are voiding the concerned bets as per compliance norms. 
    This action is crucial to preserve platform fairness and prevent recurrence of such cases.
  </h2>
</div>
<h2 className="pb-[3px]">
  We hope for your understanding and collaborative approach on this matter.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
        "Live Line Betting": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Hope you are doing well.</h2>
  <h2 className="pb-[10px]">
    We have checked your customers profit and loss, which is unexpected.
    After further consultation with the Risk team, The customers bets
    are back and lay in the same minute, in such cases all such bets of
    the customer will be treated as invalid.
  </h2>
  <h2>
    <strong>Reference IDs with the amount</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> By voiding the bets of customers who have placed
    bets with the same pattern, we can ensure a fair and unbiased
    betting experience for all. Let's take a step towards a more
    transparent and trustworthy system by eliminating any potential for
    unfair advantages. Voiding these bets will promote integrity and
    prove our commitment to providing a safe and enjoyable experience to
    all our customers.
  </h2>
</div>
<h2 className="pb-[3px]">
  Hope you can understand the situation better and we welcome your
  positive approach.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
      };
      const defaultContent =
        defaultContents[proofType] || `Default content for ${proofType}...`;
      proof = await Proof.create({
        type: proofType,
        content: defaultContent,
        notes: "",
        user,
      });
      console.log(`Created new proof for type ${proofType}, user ${user}`);
    }

    res.json({
      type: proof.type,
      content: proof.content,
      notes: proof.notes,
      user: proof.user,
    });
  } catch (error) {
    console.error(
      `Error in getProofByType for type ${req.params.type}, user ${req.query.user}:`,
      error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProofs = async (req, res) => {
  try {
    const user = req.query.user;
    let proofs;

    if (user) {
      // Validate user if provided
      const userExists = await whitelabel.findOne({ user });
      if (!userExists) {
        console.log(`User ${user} not found in whitelabel`);
        return res
          .status(400)
          .json({ message: "Invalid user: User not found in whitelabel" });
      }
      proofs = await Proof.find({ user });
    } else {
      // Fetch all proofs if no user is provided
      proofs = await Proof.find();
    }

    console.log(
      `Found ${proofs.length} proofs${user ? ` for user ${user}` : ""}`
    );
    res.json(proofs);
  } catch (error) {
    console.error(
      `Error in getAllProofs${
        req.query.user ? ` for user ${req.query.user}` : ""
      }:`,
      error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProofContent = async (req, res) => {
  try {
    const { notes } = req.body;
    const user = req.query.user;
    const proofType = req.params.type;

    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    const validProofTypes = [
      "Technical Malfunction",
      "Odds Manipulating Or Odds Hedging",
      "Live Line and Ground Line",
      "Live Line Betting",
    ];
    if (!validProofTypes.includes(proofType)) {
      return res.status(400).json({ message: "Invalid proof type" });
    }

    if (!notes && notes !== "") {
      return res.status(400).json({ message: "Valid notes are required" });
    }

    let proof = await Proof.findOne({
      type: { $regex: new RegExp(`^${proofType}$`, "i") },
      user,
    });

    if (!proof) {
      console.log(
        `Proof type ${proofType} not found for user ${user}. Creating new proof.`
      );
      const defaultContents = {
        "Technical Malfunction": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Greetings from the Risk Management Team.</h2>
  <h2 className="pb-[10px]">
    Upon reviewing recent activity, we noticed a set of customer transactions that display an irregular profit spike.
    The review indicates betting patterns where customers consistently hedge within seconds, often on sharp odds movement. 
    In such cases, these will be considered as odds manipulating or odds hedging.
  </h2>
  <h2>
    <strong>Transaction IDs with timestamps</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> Taking proactive steps by flagging and voiding such transactions helps in safeguarding platform integrity.
    It also assures genuine users that fair play is always prioritized.
  </h2>
</div>
<h2 className="pb-[3px]">
  We appreciate your support in maintaining a safe betting ecosystem.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
        "Odds Manipulating Or Odds Hedging": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Trust this message finds you well.</h2>
  <h2 className="pb-[10px]">
    We have come across user accounts where the betting activity shows unusual behavior, 
    such as placing multiple counter bets in under a minute across volatile markets.
    Based on our internal policy, such activity is classified as risk policy breach due to rapid-fire hedging.
  </h2>
  <h2>
    <strong>Impacted Markets and Stake Amounts</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> In accordance with fair use terms, these bets will be voided to ensure no exploitation of technical or market loopholes.
    Our responsibility is to ensure that the platform is used ethically by all parties.
  </h2>
</div>
<h2 className="pb-[3px]">
  Thank you for your continued cooperation and understanding.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
        "Live Line and Ground Line": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Warm greetings from our side.</h2>
  <h2 className="pb-[10px]">
    We have recently detected a set of bets placed under similar timing and pattern, likely intended to leverage 
    a gap in real-time odds fluctuation. Upon evaluation with our risk protocols, we consider this an act of market manipulation or exploitative behavior.
  </h2>
  <h2>
    <strong>Matched Bets & Customer Details</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> We are voiding the concerned bets as per compliance norms. 
    This action is crucial to preserve platform fairness and prevent recurrence of such cases.
  </h2>
</div>
<h2 className="pb-[3px]">
  We hope for your understanding and collaborative approach on this matter.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
        "Live Line Betting": `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Hope you are doing well.</h2>
  <h2 className="pb-[10px]">
    We have checked your customers profit and loss, which is unexpected.
    After further consultation with the Risk team, The customers bets
    are back and lay in the same minute, in such cases all such bets of
    the customer will be treated as invalid.
  </h2>
  <h2>
    <strong>Reference IDs with the amount</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> By voiding the bets of customers who have placed
    bets with the same pattern, we can ensure a fair and unbiased
    betting experience for all. Let's take a step towards a more
    transparent and trustworthy system by eliminating any potential for
    unfair advantages. Voiding these bets will promote integrity and
    prove our commitment to providing a safe and enjoyable experience to
    all our customers.
  </h2>
</div>
<h2 className="pb-[3px]">
  Hope you can understand the situation better and we welcome your
  positive approach.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
      };
      proof = await Proof.create({
        type: proofType,
        content:
          defaultContents[proofType] || `Default content for ${proofType}...`,
        notes: notes ? notes.trim() : "",
        user,
      });
      console.log(`Created new proof for type ${proofType}, user ${user}`);
    } else {
      proof = await Proof.findOneAndUpdate(
        { type: { $regex: new RegExp(`^${proofType}$`, "i") }, user },
        { notes: notes ? notes.trim() : "" },
        { new: true, writeConcern: { w: "majority" } }
      );
    }

    if (!proof) {
      console.log(
        `Failed to update or create proof type ${proofType} for user ${user}`
      );
      return res
        .status(500)
        .json({ message: "Failed to update or create proof" });
    }

    res.json({ message: "Notes updated successfully", proof });
  } catch (error) {
    console.error(
      `Error in updateProofContent for type ${req.params.type}, user ${req.query.user}:`,
      error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProof = async (req, res) => {
  try {
    const user = req.query.user;
    const proofType = req.params.type;

    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    const proof = await Proof.findOneAndDelete({
      type: { $regex: new RegExp(`^${proofType}$`, "i") },
      user,
    });

    if (!proof) {
      return res.status(404).json({ message: "Proof not found" });
    }

    console.log(`Deleted proof for type ${proofType}, user ${user}`);
    res.json({ message: "Proof deleted successfully" });
  } catch (error) {
    console.error(
      `Error in deleteProof for type ${req.params.type}, user ${req.query.user}:`,
      error.message
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const initializeProofs = async () => {
  try {
    const whitelabels = await whitelabel.find().select("user");

    if (!whitelabels.length) {
      console.log("No whitelabel users found for proof initialization");
      return;
    }

    const proofTypes = [
      {
        type: "Technical Malfunction",
        content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Greetings from the Risk Management Team.</h2>
  <h2 className="pb-[10px]">
    Upon reviewing recent activity, we noticed a set of customer transactions that display an irregular profit spike.
    The review indicates betting patterns where customers consistently hedge within seconds, often on sharp odds movement. 
    In such cases, these will be considered as odds manipulating or odds hedging.
  </h2>
  <h2>
    <strong>Transaction IDs with timestamps</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> Taking proactive steps by flagging and voiding such transactions helps in safeguarding platform integrity.
    It also assures genuine users that fair play is always prioritized.
  </h2>
</div>
<h2 className="pb-[3px]">
  We appreciate your support in maintaining a safe betting ecosystem.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
      },
      {
        type: "Odds Manipulating Or Odds Hedging",
        content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Trust this message finds you well.</h2>
  <h2 className="pb-[10px]">
    We have come across user accounts where the betting activity shows unusual behavior, 
    such as placing multiple counter bets in under a minute across volatile markets.
    Based on our internal policy, such activity is classified as risk policy breach due to rapid-fire hedging.
  </h2>
  <h2>
    <strong>Impacted Markets and Stake Amounts</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> In accordance with fair use terms, these bets will be voided to ensure no exploitation of technical or market loopholes.
    Our responsibility is to ensure that the platform is used ethically by all parties.
  </h2>
</div>
<h2 className="pb-[3px]">
  Thank you for your continued cooperation and understanding.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
      },
      {
        type: "Live Line and Ground Line",
        content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Warm greetings from our side.</h2>
  <h2 className="pb-[10px]">
    We have recently detected a set of bets placed under similar timing and pattern, likely intended to leverage 
    a gap in real-time odds fluctuation. Upon evaluation with our risk protocols, we consider this an act of market manipulation or exploitative behavior.
  </h2>
  <h2>
    <strong>Matched Bets & Customer Details</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> We are voiding the concerned bets as per compliance norms. 
    This action is crucial to preserve platform fairness and prevent recurrence of such cases.
  </h2>
</div>
<h2 className="pb-[3px]">
  We hope for your understanding and collaborative approach on this matter.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
      },
      {
        type: "Live Line Betting",
        content: `<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px]">
  <h2 className="pb-[3px]">Dear Merchant,</h2>
  <h2 className="pb-[10px]">Hope you are doing well.</h2>
  <h2 className="pb-[10px]">
    We have checked your customers profit and loss, which is unexpected.
    After further consultation with the Risk team, The customers bets
    are back and lay in the same minute, in such cases all such bets of
    the customer will be treated as invalid.
  </h2>
  <h2>
    <strong>Reference IDs with the amount</strong>
  </h2>
</div>
<div className="text-[12px] leading-[1.5] pl-[12px] pr-[12px] border-[2px] border-[red] m-[2px] mb-[10px]">
  <h2>
    <strong>Conclusion:</strong> By voiding the bets of customers who have placed
    bets with the same pattern, we can ensure a fair and unbiased
    betting experience for all. Let's take a step towards a more
    transparent and trustworthy system by eliminating any potential for
    unfair advantages. Voiding these bets will promote integrity and
    prove our commitment to providing a safe and enjoyable experience to
    all our customers.
  </h2>
</div>
<h2 className="pb-[3px]">
  Hope you can understand the situation better and we welcome your
  positive approach.
</h2>
<h2>Regards,</h2>
<h2 className="pb-[7px]">
  <strong>Risk Team.</strong>
</h2>`,
      },
    ];

    for (const wl of whitelabels) {
      for (const proof of proofTypes) {
        const exists = await Proof.findOne({
          type: proof.type,
          user: wl.user,
        });
        if (!exists) {
          await Proof.create({
            ...proof,
            user: wl.user,
          });
          console.log(`Initialized proof ${proof.type} for user ${wl.user}`);
        } else {
          console.log(`Proof ${proof.type} already exists for user ${wl.user}`);
        }
      }
    }
    console.log("Proof initialization completed");
  } catch (error) {
    console.error("Error in initializeProofs:", error.message);
  }
};
