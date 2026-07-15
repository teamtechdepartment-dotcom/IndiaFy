const htmlContent = (otp, type) => {
    return `
    <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
      <div style="max-width:400px; margin:auto; background:#fff; border-radius:10px; overflow:hidden;">
        
        <div style="background:#5f30ce; color:#fff; text-align:center; padding:15px; font-size:20px;">
          Verify Your Email
        </div>

        <div style="padding:20px; text-align:center;">
          <h2>Your OTP Code</h2>
          <p style="color:#666;">Use this OTP to complete your ${type}</p>

          <div style="margin:20px 0;">
            <span style="
              font-size:26px;
              letter-spacing:5px;
              font-weight:bold;
              color:#5f30ce;
              background:#f2f0ff;
              padding:10px 18px;
              border-radius:8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="font-size:12px; color:#999;">
            Valid for 5 minutes. Do not share.
          </p>
        </div>

        <div style="text-align:center; padding:10px; font-size:12px; color:#aaa;">
          Ignore if not requested
        </div>

      </div>
    </div>
    `
}

export default htmlContent;