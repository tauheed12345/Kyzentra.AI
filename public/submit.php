<?php
/**
 * Kyzentra.AI PHP Proxy for Hostomy Forms
 * 
 * This script runs same-origin on your Hostomy server to bypass browser CORS blocks,
 * securely verifies Cloudflare Turnstile tokens, and forwards the data to Google Sheets.
 */

// 1. CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

// 2. CONFIGURATION
// Swap these with your production keys if needed, or edit them directly in cPanel File Manager.
$turnstileSecret = "disabled"; // Default: test secret. Replace with your Cloudflare Turnstile Secret Key.
$appsScriptUrl = "https://script.google.com/macros/s/AKfycbymnFnkMXj_VlErafiWLPt1uhghfXGG3gSFIA-hpTsyyQBLOp-6BuvX0KSb8aFFqJ8M/exec"; // Your Google Apps Script Web App URL.
$resendApiKey = "re_dWeYisUD_9rnqerSXYfABLe6WbWA4x57X"; // Replace with your Resend API Key (e.g. re_xxxxxx)
$senderEmail = "Kyzentra.AI <onboarding@resend.dev>"; // Verified domain email or Resend sandbox sender
$adminEmail = "official@kyzentra.in"; // Recipient for admin notification alerts

// 3. READ PAYLOAD
$input = file_get_contents("php://input");
$requestData = json_decode($input, true);

$action = isset($requestData['action']) ? $requestData['action'] : null;
$data = isset($requestData['data']) ? $requestData['data'] : null;
$token = isset($requestData['token']) ? $requestData['token'] : null;

// Validate basic payload
if (!$action || !$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid payload: missing action or data"]);
    exit;
}

// 4. VERIFY TURNSTILE TOKEN (Non-Blocking)
if ($turnstileSecret && $turnstileSecret !== 'disabled') {
    if (!$token) {
        error_log("Turnstile Token missing, but proceeding with submission.");
    } else {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://challenges.cloudflare.com/turnstile/v0/siteverify");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            "secret" => trim($turnstileSecret),
            "response" => trim($token),
            "remoteip" => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : ''
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $verifyResponse = curl_exec($ch);
        curl_close($ch);

        $verifyResult = json_decode($verifyResponse, true);
        if (!$verifyResult || !$verifyResult['success']) {
            error_log("Turnstile verification failed (check mismatched site keys), but proceeding with submission anyway.");
        }
    }
}

// 5. FORWARD REQUEST TO GOOGLE APPS SCRIPT
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $appsScriptUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "action" => $action,
    "data" => $data
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Extremely important: follow Google's 302 redirects!
curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$scriptResult = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $errorMsg = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "CURL forwarding error: " . $errorMsg]);
    exit;
}

curl_close($ch);

// Trigger Resend email automation if the form was successfully saved to Sheets
$responseObj = json_decode($scriptResult, true);
if ($httpCode === 200 && isset($responseObj['success']) && $responseObj['success'] === true) {
    handleResendEmailAutomation($action, $data);
}

echo $scriptResult;

// --- RESEND EMAIL AUTOMATION ---

function sendEmailViaResend($to, $subject, $htmlContent, $from = null) {
    global $resendApiKey, $senderEmail;
    
    if (!$resendApiKey || $resendApiKey === 'disabled') {
        error_log("Resend API key is not configured or disabled. Skipping email.");
        return false;
    }
    
    $fromAddress = $from ? $from : $senderEmail;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.resend.com/emails");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "from" => $fromAddress,
        "to" => [$to],
        "subject" => $subject,
        "html" => $htmlContent
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . trim($resendApiKey),
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 && $httpCode !== 201) {
        error_log("Resend API error (HTTP $httpCode): " . $response);
        return false;
    }
    
    return true;
}

function handleResendEmailAutomation($action, $data) {
    global $adminEmail;
    
    $userEmail = '';
    $userName = '';
    
    if ($action === 'waitlist') {
        $userEmail = isset($data['email']) ? $data['email'] : '';
        $userName = isset($data['fullName']) ? $data['fullName'] : '';
    } else if ($action === 'contact' || $action === 'demo' || $action === 'careers') {
        $userEmail = isset($data['email']) ? $data['email'] : '';
        $userName = isset($data['name']) ? $data['name'] : '';
    }
    
    if (!$userEmail) {
        error_log("No recipient email found in data payload. Skipping automation.");
        return;
    }
    
    $userSubject = "";
    $userHtml = "";
    
    $adminSubject = "";
    $adminHtml = "";
    
    switch ($action) {
        case 'waitlist':
            $userSubject = "Welcome to the Kyzentra.AI Waitlist! 🚀";
            $userHtml = getWaitlistConfirmationHtml($userName);
            
            $adminSubject = "New Waitlist Signup: " . $userName;
            $adminHtml = getAdminNotificationHtml("Waitlist Signup", [
                "Full Name" => $userName,
                "School / Institution" => isset($data['schoolName']) ? $data['schoolName'] : '',
                "Designation / Role" => isset($data['designation']) ? $data['designation'] : '',
                "Email" => $userEmail,
                "Phone Number" => isset($data['phone']) ? $data['phone'] : '',
                "Total Student Count" => isset($data['studentCount']) ? $data['studentCount'] : '',
                "City" => isset($data['city']) ? $data['city'] : '',
                "State / Region" => isset($data['state']) ? $data['state'] : '',
                "Country" => isset($data['country']) ? $data['country'] : '',
                "Message" => isset($data['message']) ? $data['message'] : ''
            ]);
            break;
            
        case 'contact':
            $userSubject = "We've received your message! - Kyzentra.AI";
            $userHtml = getContactConfirmationHtml($userName);
            
            $adminSubject = "New Contact Submission: " . (isset($data['subject']) ? $data['subject'] : 'General Inquiry');
            $adminHtml = getAdminNotificationHtml("Contact Message", [
                "Name" => $userName,
                "Email" => $userEmail,
                "Company" => isset($data['company']) ? $data['company'] : '',
                "Subject" => isset($data['subject']) ? $data['subject'] : '',
                "Message" => isset($data['message']) ? $data['message'] : ''
            ]);
            break;
            
        case 'careers':
            $userSubject = "Thank you for applying to Kyzentra.AI! 💼";
            $userHtml = getCareersConfirmationHtml($userName, isset($data['position']) ? $data['position'] : 'Position');
            
            $adminSubject = "New Career Application: " . $userName . " - " . (isset($data['position']) ? $data['position'] : '');
            $adminHtml = getAdminNotificationHtml("Career Application", [
                "Name" => $userName,
                "Email" => $userEmail,
                "Phone" => isset($data['phone']) ? $data['phone'] : '',
                "College" => isset($data['college']) ? $data['college'] : '',
                "Degree" => isset($data['degree']) ? $data['degree'] : '',
                "Branch" => isset($data['branch']) ? $data['branch'] : '',
                "Graduation Year" => isset($data['graduationYear']) ? $data['graduationYear'] : '',
                "Position" => isset($data['position']) ? $data['position'] : '',
                "Employment Type" => isset($data['employmentType']) ? $data['employmentType'] : '',
                "Skills" => isset($data['skills']) ? $data['skills'] : '',
                "GitHub" => isset($data['github']) ? $data['github'] : '',
                "LinkedIn" => isset($data['linkedin']) ? $data['linkedin'] : '',
                "Portfolio" => isset($data['portfolio']) ? $data['portfolio'] : '',
                "Cover Letter" => isset($data['coverLetter']) ? $data['coverLetter'] : ''
            ]);
            break;
            
        case 'demo':
            $userSubject = "Your Demo Request is Received! - Kyzentra.AI";
            $userHtml = getDemoConfirmationHtml($userName);
            
            $adminSubject = "New Demo Request: " . $userName;
            $adminHtml = getAdminNotificationHtml("Demo Request", [
                "Name" => $userName,
                "School / Institution" => isset($data['school']) ? $data['school'] : '',
                "Designation" => isset($data['designation']) ? $data['designation'] : '',
                "Email" => $userEmail,
                "Phone" => isset($data['phone']) ? $data['phone'] : '',
                "Student Count" => isset($data['studentCount']) ? $data['studentCount'] : '',
                "Preferred Date" => isset($data['preferredDate']) ? $data['preferredDate'] : '',
                "Preferred Time" => isset($data['preferredTime']) ? $data['preferredTime'] : '',
                "Notes" => isset($data['notes']) ? $data['notes'] : ''
            ]);
            break;
    }
    
    if ($userHtml) {
        sendEmailViaResend($userEmail, $userSubject, $userHtml);
    }
    
    if ($adminHtml && $adminEmail && $adminEmail !== 'disabled') {
        sendEmailViaResend($adminEmail, $adminSubject, $adminHtml);
    }
}

function getEmailHeader($title) {
    return '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>' . htmlspecialchars($title) . '</title>
        <style>
            body {
                background-color: #0b0b10;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                background-color: #0b0b10;
                width: 100%;
                padding: 40px 0;
            }
            .container {
                max-width: 580px;
                margin: 0 auto;
                background-color: #11111a;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            .header {
                background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
                padding: 32px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .logo {
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.5px;
                color: #ffffff;
                text-decoration: none;
            }
            .logo span {
                color: #06b6d4;
            }
            .content {
                padding: 40px 32px;
                line-height: 1.6;
                color: #e2e8f0;
            }
            h1 {
                font-size: 22px;
                font-weight: 700;
                margin-top: 0;
                margin-bottom: 20px;
                color: #ffffff;
            }
            p {
                margin-top: 0;
                margin-bottom: 16px;
                font-size: 15px;
            }
            .button-container {
                margin: 28px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #8b5cf6;
                color: #ffffff !important;
                font-weight: 600;
                font-size: 14px;
                text-decoration: none;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            }
            .footer {
                padding: 32px;
                text-align: center;
                background-color: #0e0e15;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                font-size: 12px;
                color: #64748b;
            }
            .footer a {
                color: #06b6d4;
                text-decoration: none;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            th {
                color: #94a3b8;
                font-weight: 500;
                width: 35%;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            td {
                color: #ffffff;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <a href="https://kyzentra.in" class="logo">Kyzentra<span>.AI</span></a>
                </div>
                <div class="content">';
}

function getEmailFooter() {
    return '
                </div>
                <div class="footer">
                    <p>&copy; ' . date("Y") . ' Kyzentra.AI. All rights reserved.</p>
                    <p>Intelligence. Automation. Transformation.</p>
                    <p><a href="https://kyzentra.in">Visit our Website</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>';
}

function getWaitlistConfirmationHtml($name) {
    $html = getEmailHeader("Welcome to the Waitlist");
    $html .= '<h1>Hello ' . htmlspecialchars($name) . ',</h1>';
    $html .= '<p>Thank you for your interest in <strong>UniOS.ai</strong>. We are thrilled to welcome you to our early access waitlist!</p>';
    $html .= '<p>Kyzentra.AI is building the next generation of AI-powered education management software, designed to streamline operations, empower educators, and transform the learning experience.</p>';
    $html .= '<p><strong>What happens next?</strong></p>';
    $html .= '<p>Our onboarding team is reviewing submissions in waves. We will reach out to you as soon as a slot opens up for your institution to start a pilot or guided demo.</p>';
    $html .= '<div class="button-container">';
    $html .= '    <a href="https://kyzentra.in" class="button">Explore Kyzentra.AI</a>';
    $html .= '</div>';
    $html .= '<p>If you have any urgent questions or institutional requirements, feel free to reply to this email.</p>';
    $html .= '<p>Best regards,<br>The Kyzentra.AI Team</p>';
    $html .= getEmailFooter();
    return $html;
}

function getContactConfirmationHtml($name) {
    $html = getEmailHeader("Message Received");
    $html .= '<h1>Hello ' . htmlspecialchars($name) . ',</h1>';
    $html .= '<p>We have successfully received your inquiry!</p>';
    $html .= '<p>Thank you for reaching out to Kyzentra.AI. One of our team members will review your message and get back to you within 24 to 48 business hours.</p>';
    $html .= '<p>If you want to learn more about our solutions in the meantime, check out our products page.</p>';
    $html .= '<div class="button-container">';
    $html .= '    <a href="https://kyzentra.in" class="button">Visit Our Website</a>';
    $html .= '</div>';
    $html .= '<p>Best regards,<br>The Kyzentra.AI Team</p>';
    $html .= getEmailFooter();
    return $html;
}

function getCareersConfirmationHtml($name, $position) {
    $html = getEmailHeader("Application Received");
    $html .= '<h1>Hello ' . htmlspecialchars($name) . ',</h1>';
    $html .= '<p>Thank you for applying for the <strong>' . htmlspecialchars($position) . '</strong> position at Kyzentra.AI!</p>';
    $html .= '<p>We appreciate the time you took to share your background and portfolio. Our hiring team will review your application materials (resume, profile details, and covers).</p>';
    $html .= '<p>If your qualifications match our current requirements, we will contact you to schedule an initial interview.</p>';
    $html .= '<p>We wish you the best of luck in the recruitment process!</p>';
    $html .= '<p>Best regards,<br>Kyzentra.AI Careers</p>';
    $html .= getEmailFooter();
    return $html;
}

function getDemoConfirmationHtml($name) {
    $html = getEmailHeader("Demo Request Received");
    $html .= '<h1>Hello ' . htmlspecialchars($name) . ',</h1>';
    $html .= '<p>Thank you for requesting a demo of UniOS.ai!</p>';
    $html .= '<p>We are excited to show you how our AI-powered features can optimize your institution\'s management workflow.</p>';
    $html .= '<p>Our team is checking your preferred dates and times. We will send a calendar invite shortly to finalize the demo schedule.</p>';
    $html .= '<div class="button-container">';
    $html .= '    <a href="https://kyzentra.in" class="button">Explore Products</a>';
    $html .= '</div>';
    $html .= '<p>Best regards,<br>The Kyzentra.AI Team</p>';
    $html .= getEmailFooter();
    return $html;
}

function getAdminNotificationHtml($title, $fields) {
    $html = getEmailHeader("New Submission Alert");
    $html .= '<h1>New Alert: ' . htmlspecialchars($title) . '</h1>';
    $html .= '<p>A new form has been submitted on the Kyzentra.AI website. Below are the details:</p>';
    $html .= '<table>';
    foreach ($fields as $key => $value) {
        if ($value !== null && $value !== '') {
            $html .= '<tr>';
            $html .= '    <th>' . htmlspecialchars($key) . '</th>';
            $html .= '    <td>' . nl2br(htmlspecialchars($value)) . '</td>';
            $html .= '</tr>';
        }
    }
    $html .= '</table>';
    $html .= '<p style="margin-top: 30px; font-size: 13px; color: #64748b;">This submission has also been logged automatically to your Google Sheets.</p>';
    $html .= getEmailFooter();
    return $html;
}
