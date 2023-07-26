const passwordRequestMailWithOTP = (otp: string) => `

            <p>Hi, you have requested to reset your password. Please use the following OTP to reset your password.</p>
            <h2 style="color: #ff0000;">${otp}</h2>
            <p>Regards,</p>
            <p>Team QrMenu</p>
            <p>
            If you think this is a mistake, please contact us at <a href="mailto: applicationqrmenu@hmail.com">here.</a>
            </p>


`;
const mailHelper = (to: string, subject: string, text: string) => {
  const body = `
    <div style="background-color: #f2f2f2; padding: 20px;">
        <div style="background-color: white; padding: 20px;">
            <h1 style="color: #ff0000;">${subject}</h1>
            <p>${text}</p>
        </div>
    </div>
    `;
  return body;
};

export { passwordRequestMailWithOTP, mailHelper };
