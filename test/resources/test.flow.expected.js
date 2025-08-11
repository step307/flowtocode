/** 
      Test Flow
      Test flow. **/
function main(RecordId: String) {
  let ItemsToProcess: SObject = null;
  let ApexInvocableActionRequest: Apex = null;
  let ActionRequests: Apex = null;

  function Final_Screen() {
    Final_Screen.show(); // Show Final Screen
  }

  apex.ApexInvocableQuery({
    accountIds: RecordId,
  });
  Select_Items_Screen.show(); // Show Select Items Screen

  // Action Loop
  for (let Action_Loop of ADataTable.selectedRows /*Asc*/) {
    // Create Request
    ApexInvocableActionRequest.aid = Action_Loop.Id;
    ApexInvocableActionRequest.value = Dollar_Amount;
    // Add Request
    ActionRequests += ApexInvocableActionRequest;
  }

  try {
    apex.ApexInvocableAction({
      ApexInvocableActionRequests: ActionRequests,
    });
    Confirmation_Screen.show(); // Show Confirmation Screen
    Final_Screen();
  } catch (e) {
    Fault_Screen.show(); // Show Fault Screen
    Final_Screen();
  }
  return [];
}