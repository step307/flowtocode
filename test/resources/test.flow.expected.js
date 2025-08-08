function Create_Request() {
  ApexInvocableActionRequest.aid = { elementReference: "Action_Loop.Id" };
  ApexInvocableActionRequest.value = { elementReference: "Dollar_Amount" };
}
function Add_Request() {
  // TODO: why nothing here?
}

function main() {
  do_Execute_Apex_Query(); // Execute_Apex_Query
  Select_Items_Screen(); // Show Select Items Screen
  foreach(ADataTable.selectedRows /*Asc*/);
  {
    Create_Request();
    Add_Request();
  }

  try {
    do_DoBulkAction(); // DoBulkAction
    Confirmation_Screen(); // Show Confirmation Screen
    Final_Screen(); // Show Final Screen
  } catch (e) {
    Fault_Screen(); // Show Fault Screen
    Final_Screen();
  }
}