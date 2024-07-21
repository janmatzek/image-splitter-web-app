import { useState } from "react";
import {
  Box,
  Text,
  Heading,
  Link,
  Button,
  Image,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Flex,
  Divider,
  Input,
} from "@chakra-ui/react";
import "./App.css";
import axios from "axios";
import JSZip from "jszip";

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [rows, setRows] = useState<number>(1);
  const [columns, setColumns] = useState<number>(3);
  const [stripeHeight, setStripeHeight] = useState<number>(1 / 6);
  const [stripesYes, setStripesYes] = useState<boolean>(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [zipUrl, setZipUrl] = useState<string>("");

  const handleProcessClick = async () => {
    if (!uploadedFile) {
      alert("Please upload an image first.");
      return;
    }

    const apiEndpoint = "http://127.0.0.1:8000/process-image/";

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("rows", rows.toString());
    formData.append("columns", columns.toString());
    formData.append("stripes", stripesYes.toString());
    formData.append("stripe_height", stripeHeight.toString());

    try {
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer",
      });
      if (response.status !== 200) {
        throw new Error("Error processing image");
      }

      // Convert response to Blob
      const blob = new Blob([response.data], { type: "application/zip" });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);
      setZipUrl(url);

      const arrayBuffer = response.data;
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(arrayBuffer);

      const files: Record<string, string> = {};
      for (const filename of Object.keys(zipContent.files)) {
        const file = zipContent.file(filename);
        if (file) {
          const fileContent = await file.async("blob");
          const fileURL = URL.createObjectURL(fileContent);
          console.log(fileURL);
          files[filename] = fileURL;
        }
      }
      console.log("Unzipped files:", files); // Debug: Log unzipped files
      setFiles(files);
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };
  const handleStripesChange = () => {
    setStripesYes(!stripesYes);
  };

  const handleRowsChange = (valueAsString: string, valueAsNumber: number) => {
    setRows(valueAsNumber);
  };

  const handleColumnsChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setColumns(valueAsNumber);
  };

  const handleStripeHeightChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setStripeHeight(valueAsNumber / 100);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = () => {
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleImageClick = () => {
    const inputElement = document.getElementById("imageUploadInput");

    if (inputElement) {
      (inputElement as HTMLInputElement).click();
    }
  };

  const processFile = (file: File) => {
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageSrc(reader.result);
          setImageUploaded(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files;

    if (fileInput && fileInput.length > 0) {
      const file = fileInput[0];
      processFile(file);
    } else {
      console.warn("No files selected or file input is null");
    }
  };

  return (
    <>
      <Box className="app-wrapper">
        <Box className="page-title">
          <Heading as="h1">Insta-friendly image splitter</Heading>
          <Divider margin="10px" />
          <Text>Upload a picture and choose how to process the image.</Text>
          <Text>
            You can split the image to a grid of squares. Optionally, you can
            add white stripes to top and bottom of the processed image(s).
          </Text>
          <Divider margin="10px" />
        </Box>
        <Flex
          className="content"
          direction="column"
          alignItems="center"
          marginTop="25px"
        >
          <Box className="image-preview">
            <Input
              type="file"
              id="imageUploadInput"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              display="none"
            />
            {imageSrc ? (
              <Box
                width="450px"
                height="150px"
                bg={dragging ? "green.300" : "green.200"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={handleImageClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              >
                <Text>Image uploaded!</Text>
              </Box>
            ) : (
              <Box
                width="250px"
                height="150px"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                bg={dragging ? "gray.300" : "gray.200"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={handleImageClick}
              >
                <Text>
                  Click to upload image <br />
                  (or drag and drop the file)
                </Text>
              </Box>
            )}
          </Box>
          <Flex
            className="image-options"
            marginTop="20px"
            border="1px"
            borderRadius={"5"}
            borderColor={"gray.300"}
            width="450px"
            height="200px"
            padding="20px"
            direction="column"
            justifyContent="space-around"
            alignItems="center"
          >
            <Flex className="rows-and-columns" direction={"row"}>
              <Flex className="input-rows" alignItems="center">
                <Text marginRight="5px">Rows:</Text>
                <NumberInput
                  defaultValue={1}
                  min={1}
                  max={20}
                  width={["75px"]}
                  marginRight="10px"
                  onChange={handleRowsChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
              <Flex className="input-columns" alignItems="center">
                <Text marginRight="5px">Columns:</Text>
                <NumberInput
                  defaultValue={3}
                  min={1}
                  max={20}
                  width={["75px"]}
                  marginRight="5px"
                  onChange={handleColumnsChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
            </Flex>

            <Switch
              isChecked={stripesYes}
              onChange={handleStripesChange}
              colorScheme="teal"
            >
              White stripes
            </Switch>
            {stripesYes ? (
              <Flex className="input-stripes" alignItems="center">
                <Text marginRight="5px">Stripe height (%): </Text>
                <NumberInput
                  defaultValue={16}
                  min={0}
                  max={100}
                  width={["75px"]}
                  onChange={handleStripeHeightChange}
                  isDisabled={!stripesYes}
                >
                  <NumberInputField />
                </NumberInput>{" "}
              </Flex>
            ) : null}
          </Flex>
          <Button
            marginTop="25px"
            marginBottom={"25px"}
            isDisabled={!imageUploaded}
            onClick={handleProcessClick}
          >
            Process image
          </Button>
        </Flex>
        <Text>
          Tap to download image in full resolution, scroll down to find full
          resolution images or download a zip with all the images by clicking{" "}
          <Link href={zipUrl}>this link</Link>.
        </Text>
        <Flex
          direction="row"
          wrap="wrap"
          gap={4}
          marginTop="25px"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, auto)`,
          }}
          justifyContent={"center"}
          background={"gray.100"}
        >
          {Object.keys(files).length === 0 && <Text>No images to display</Text>}
          {Object.keys(files).map((filename) => (
            <Box
              key={filename}
              marginBottom={2}
              marginTop={2}
              style={{
                width: `calc(100% / ${columns} - 16px)`,
                height: "auto",
                position: "relative",
              }}
            >
              <Link href={files[filename]} download={filename}>
                <Image
                  src={files[filename]}
                  alt={filename}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />
              </Link>
            </Box>
          ))}
        </Flex>

        <Flex direction="column" mt={4}>
          {Object.keys(files).map((filename) => (
            <Box key={filename} marginBottom={2}>
              <Image
                src={files[filename]}
                alt={filename}
                style={{ maxWidth: "100%" }}
              />
            </Box>
          ))}
        </Flex>
        <Box className="footer" marginTop="25px">
          <Text>
            Made with 🖤 by{" "}
            <Link
              href="https://janmatzek.github.io"
              target="_blank"
              rel="noopener, noreferrer"
            >
              Jan Matzek
            </Link>
          </Text>
        </Box>
      </Box>
    </>
  );
}

export default App;
