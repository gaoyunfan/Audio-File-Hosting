"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/registerFrom";
import { handleRegister } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toastSucccess, toastError } from "@/lib/utils";
import { useUserSession } from "@/lib/hooks";
import { RegisterFormData } from "@/lib/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const { updateUserSession } = useUserSession();

  const onSubmit = async (values: RegisterFormData) => {
    const res = await handleRegister(values);

    if (res.success) {
      toastSucccess("Register successful");
      await updateUserSession();
      router.push("/");
    } else {
      toastError(res.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm onSubmit={onSubmit} showLogin={true} />
        </CardContent>
      </Card>
    </div>
  );
}
