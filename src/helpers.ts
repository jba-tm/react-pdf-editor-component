// @ts-ignore
import {Template, Font, checkTemplate, BLANK_PDF} from "@pdfme/common";

const fontObjList = [
    {
        fallback: true,
        label: "NotoSerifJP-Regular",
        url: "/fonts/NotoSerifJP-Regular.otf",
    },
    {
        fallback: false,
        label: "NotoSansJP-Regular",
        url: "/fonts/NotoSansJP-Regular.otf",
    },
];

export const getFontsData = async () => {
    const fontDataList = await Promise.all(
        fontObjList.map(async (font) => ({
            ...font,
            data: await fetch(font.url).then((res) => res.arrayBuffer()),
        }))
    );

    return fontDataList.reduce(
        (acc, font) => ({...acc, [font.label]: font}),
        {} as Font
    );
};


// export function readFile(file: File) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = (event) => {
//             resolve(event?.target?.result);
//         };
//         reader.onerror = (event) => {
//             reader.abort();
//             reject(event);
//         };
//         reader.readAsDataURL(file);
//     });
// }


export const readFile = (
    file: File | null,
    type: "text" | "dataURL" | "arrayBuffer"
) => {
    return new Promise<string | ArrayBuffer>((r) => {
        const fileReader = new FileReader();
        fileReader.addEventListener("load", (e) => {
            if (e && e.target && e.target.result && file !== null) {
                r(e.target.result);
            }
        });
        if (file !== null) {
            if (type === "text") {
                fileReader.readAsText(file);
            } else if (type === "dataURL") {
                fileReader.readAsDataURL(file);
            } else if (type === "arrayBuffer") {
                fileReader.readAsArrayBuffer(file);
            }
        }
    });
};

export const cloneDeep = (obj: any) => JSON.parse(JSON.stringify(obj));

export const getTemplateFromJsonFile = (file: File) => {
    return readFile(file, "text").then((jsonStr) => {
        const template: Template = JSON.parse(jsonStr as string);
        try {
            checkTemplate(template);
            return template;
        } catch (e) {
            throw e;
        }
    });
};

export const downloadJsonFile = (json: any, title: string) => {
    if (typeof window !== "undefined") {
        const blob = new Blob([JSON.stringify(json)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

export const isJsonString = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

export const getTemplate = () => {
    const template: Template = {
        "schemas": [],
        "basePdf": BLANK_PDF
    };
    return template;
};


export function isImage(file: File) {
    if (file.type.split('/')[0] === 'image') {
        return true;
    }
}

export function convertBytesToMbsOrKbs(filesize: number) {
    let size = '';
    if (filesize >= 1048576) {
        size = (filesize / 1048576) + ' megabytes';
    } else if (filesize >= 1024) {
        size = (filesize / 1024) + ' kilobytes';
    } else {
        size = filesize + ' bytes';
    }
    return size;
}

export async function createFileFromUrl(url: string) {
    const response = await fetch(url);
    const data = await response.blob();
    const metadata = {type: data.type};
    const filename: string = (url.replace(/\?.+/, '') || '').split('/').pop() || '';
    return new File([data], filename, metadata);
}
