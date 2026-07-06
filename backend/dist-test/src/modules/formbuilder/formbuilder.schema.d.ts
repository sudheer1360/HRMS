import { z } from 'zod';
export declare const createFormSchema: z.ZodObject<{
    companyId: z.ZodString;
    formName: z.ZodString;
    formCategory: z.ZodString;
    fields: z.ZodArray<z.ZodObject<{
        fieldName: z.ZodString;
        fieldLabel: z.ZodString;
        fieldType: z.ZodEnum<["text", "number", "date", "dropdown", "multi-select", "checkbox", "radio", "file", "textarea", "rating", "signature", "calculated", "richtext", "section"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        placeholder: z.ZodOptional<z.ZodString>;
        conditionalLogic: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        fieldName: string;
        fieldLabel: string;
        fieldType: "number" | "date" | "text" | "dropdown" | "multi-select" | "checkbox" | "radio" | "file" | "textarea" | "rating" | "signature" | "calculated" | "richtext" | "section";
        required: boolean;
        options?: string[] | undefined;
        placeholder?: string | undefined;
        conditionalLogic?: any;
    }, {
        fieldName: string;
        fieldLabel: string;
        fieldType: "number" | "date" | "text" | "dropdown" | "multi-select" | "checkbox" | "radio" | "file" | "textarea" | "rating" | "signature" | "calculated" | "richtext" | "section";
        options?: string[] | undefined;
        required?: boolean | undefined;
        placeholder?: string | undefined;
        conditionalLogic?: any;
    }>, "many">;
    status: z.ZodDefault<z.ZodEnum<["Draft", "Published", "Archived"]>>;
}, "strip", z.ZodTypeAny, {
    fields: {
        fieldName: string;
        fieldLabel: string;
        fieldType: "number" | "date" | "text" | "dropdown" | "multi-select" | "checkbox" | "radio" | "file" | "textarea" | "rating" | "signature" | "calculated" | "richtext" | "section";
        required: boolean;
        options?: string[] | undefined;
        placeholder?: string | undefined;
        conditionalLogic?: any;
    }[];
    status: "Draft" | "Published" | "Archived";
    companyId: string;
    formName: string;
    formCategory: string;
}, {
    fields: {
        fieldName: string;
        fieldLabel: string;
        fieldType: "number" | "date" | "text" | "dropdown" | "multi-select" | "checkbox" | "radio" | "file" | "textarea" | "rating" | "signature" | "calculated" | "richtext" | "section";
        options?: string[] | undefined;
        required?: boolean | undefined;
        placeholder?: string | undefined;
        conditionalLogic?: any;
    }[];
    companyId: string;
    formName: string;
    formCategory: string;
    status?: "Draft" | "Published" | "Archived" | undefined;
}>;
export declare const submitResponseSchema: z.ZodObject<{
    formId: z.ZodString;
    responses: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    responses: Record<string, any>;
}, {
    formId: string;
    responses: Record<string, any>;
}>;
//# sourceMappingURL=formbuilder.schema.d.ts.map