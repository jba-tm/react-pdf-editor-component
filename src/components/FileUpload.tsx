import React, {useState} from 'react';
import {DropEvent} from 'react-dropzone';

import {Box, Paper} from '@mui/material';
import DropzoneArea from "./Dropzone/DropzoneArea";


import {Viewer, Worker, ScrollMode} from '@react-pdf-viewer/core';
import {readFile} from "../helpers";

import {toolbarPlugin} from '@react-pdf-viewer/toolbar';
import {searchPlugin} from '@react-pdf-viewer/search';

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import {scrollModePlugin} from '@react-pdf-viewer/scroll-mode';
import type {ToolbarSlot, TransformToolbarSlot} from '@react-pdf-viewer/toolbar';

import SearchSidebar from './Sidebar';

type PDFFile = File | null;

function FileUpload() {
    const [pdfFile, setPdfFile] = useState<PDFFile>(null);
    const [pdfData, setPdfData] = useState<string | ArrayBuffer>("");

    const toolbarPluginInstance = toolbarPlugin();
    const searchPluginInstance = searchPlugin();
    const scrollModePluginInstance = scrollModePlugin();
    const {renderDefaultToolbar, Toolbar} = toolbarPluginInstance;

    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const transform: TransformToolbarSlot = (slot: ToolbarSlot) => {
        const {NumberOfPages} = slot;
        return Object.assign({}, slot, {
            NumberOfPages: () => (
                <>
                    of <NumberOfPages/>
                </>
            ),
        });
    };


    const onDrop = async (acceptedFiles: File[], event: DropEvent) => {
        // Ensure only PDF files are accepted
        const isPDF = acceptedFiles.every((file) => file.type === 'application/pdf');

        if (isPDF) {
            setPdfFile(acceptedFiles[0]);

            const result = await readFile(acceptedFiles[0], "dataURL")
            setPdfData(result)
        } else {
            console.error('Invalid file type. Please upload PDF files only.');
        }
    }


    if (!pdfFile) {
        return (
            <Paper elevation={3} style={{padding: 5}}>
                <Box p={3} textAlign="center">
                    <DropzoneArea
                        acceptedFiles={{'application/pdf': [".pdf"]}}
                        dropzoneText={"Drag and drop an image here or click"}
                        onChange={(files) => console.log('Files:', files)}
                        filesLimit={10}
                        onDrop={onDrop}
                    />
                </Box>
            </Paper>
        )
    }

    if (!pdfData) {
        return <div>Loading</div>
    }

    return (
        <Paper elevation={3} style={{padding: 5}}>
            <Box p={3} textAlign="center">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.js">
                    <div
                        className="rpv-core__viewer"
                        style={{
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                alignItems: 'center',
                                backgroundColor: '#eeeeee',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                padding: '4px',
                            }}
                        >
                            <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                        </div>
                        <div
                            style={{
                                border: '1px solid rgba(0, 0, 0, .3)',
                                display: 'flex',
                                height: '100%',
                                width: '100%',
                            }}>

                            <div
                                style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Viewer
                                    fileUrl={pdfData as string}
                                    plugins={[toolbarPluginInstance, searchPluginInstance]}
                                    // scrollMode={ScrollMode.Horizontal}
                                />
                            </div>
                            <div
                                style={{
                                    borderLeft: '1px solid rgba(0, 0, 0, .2)',
                                    flex: '0 0 15rem',
                                    width: '15rem',
                                }}
                            >
                                <SearchSidebar searchPluginInstance={searchPluginInstance}/>
                            </div>
                        </div>
                    </div>
                    {/*<div*/}
                    {/*    style={{*/}
                    {/*        height: '750px',*/}
                    {/*        width: '900px',*/}
                    {/*        marginLeft: 'auto',*/}
                    {/*        marginRight: 'auto',*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <Viewer*/}
                    {/*        fileUrl={pdfData as string}*/}
                    {/*        plugins={[defaultLayoutPluginInstance]}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </Worker>
            </Box>
        </Paper>
    );
}

export default FileUpload;
