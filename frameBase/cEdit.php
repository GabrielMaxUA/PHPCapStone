<?php
 session_start();

require 'connect.php';
 
$postdata = file_get_contents("php://input");
 
if (isset($postdata) && !empty($postdata))
{
    $request = json_decode($postdata);
 
    if ((int)$request->data->contactID < 1 || trim($request->data->firstName) == '' || trim($request->data->lastName) == '' || 
    trim($request->data->eMail) == '' || trim($request->data->phone) == '')
    {
        return http_response_code(400);
    }
 
    $contactID = mysqli_real_escape_string($con, (int)$request->data->contactID);
    $firstName = mysqli_real_escape_string($con, trim($request->data->firstName));
    $lastName = mysqli_real_escape_string($con, trim($request->data->lastName));
    $eMail = mysqli_real_escape_string($con, trim($request->data->eMail));
    $phone = mysqli_real_escape_string($con, trim($request->data->phone));
 
    $sql = "UPDATE `contacts` SET `firstName`='$firstName',`lastName`='$lastName',`eMail`='$eMail',`phone`='$phone' WHERE `contactID` = '{$contactID}' LIMIT 1";
 
    if(mysqli_query($con, $sql))
    {
        http_response_code(204);
    }
    else
    {
        return http_response_code(422);
    }
}
 
?>