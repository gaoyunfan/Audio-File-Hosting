"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleRegister } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toastSucccess, toastError } from "@/lib/utils";
import { registerSchema, RegisterFormData } from "@/lib/schemas";
import { useUserSession } from "@/lib/hooks";
export default function RegisterPage() {
  const router = useRouter();
  const { updateUserSession } = useUserSession();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      password2: "",
    },
    mode: "onChange",
  });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                Register
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{"  "}
                <Link
                  href="/user/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
