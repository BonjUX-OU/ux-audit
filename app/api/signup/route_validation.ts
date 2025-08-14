export async function ValidatePayloadUserSignup(body: any): Promise<boolean> {

        const { name, email, password } = body;
    
        if (!name || !email || !password) {
        return false;
        }
    
        if (!isValidEmail(email)) {
        return false;
        }
    
        if (password.length < 6) {
        return false;
        }
    
        return true;
    
}

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
