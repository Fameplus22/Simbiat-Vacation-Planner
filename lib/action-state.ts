export type FieldErrors = Record<string, string>;

export type ActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: FieldErrors;
};

export const idleActionState: ActionState = {
  status: "idle",
  message: "",
};
