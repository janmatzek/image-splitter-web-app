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
  Spinner,
} from "@chakra-ui/react";
import "./App.css";
import axios from "axios";
import JSZip from "jszip";

// TODO: Error handling

function App() {
  const [loading, setLoading] = useState<boolean>(false);
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
  const [filesProcessed, setFilesProcessed] = useState<boolean>(false);

  const handleProcessClick = async () => {
    setLoading(true);
    if (!uploadedFile) {
      alert("Please upload an image first.");
      setLoading(false);
      return;
    }

    const apiEndpoint = import.meta.env.VITE_API_URL;

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

      setFiles(files);
      setFilesProcessed(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const handleStripesChange = () => {
    setStripesYes(!stripesYes);
  };

  const handleRowsChange = (_valueAsString: string, valueAsNumber: number) => {
    setRows(valueAsNumber);
  };

  const handleColumnsChange = (
    _valueAsString: string,
    valueAsNumber: number
  ) => {
    setColumns(valueAsNumber);
  };

  const handleStripeHeightChange = (
    _valueAsString: string,
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
      <Flex
        className="app-wrapper"
        maxWidth="1280px"
        margin="0 auto"
        padding="2rem"
        direction="column"
        alignItems="center"
        minHeight="100vh"
      >
        <Flex
          className="page-title"
          direction="column"
          alignItems="center"
          textAlign="center"
          marginBottom="25px"
        >
          <Heading as="h1">Insta-friendly image splitter</Heading>
          <Divider margin="10px" />
          <Text>Upload a picture and choose how to process the image.</Text>
          <Text>
            You can split the image into a grid of squares. Optionally, you can
            add white stripes to the top and bottom of the processed image(s).
          </Text>
          <Divider margin="10px" />
        </Flex>

        <Flex
          className="content"
          direction="column"
          alignItems="center"
          width="100%"
          maxWidth="450px"
        >
          <Box className="image-preview" width="100%">
            <Input
              type="file"
              id="imageUploadInput"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              display="none"
            />
            <Box
              width="100%"
              height="150px"
              background={
                imageSrc
                  ? dragging
                    ? "green.300"
                    : "green.200"
                  : dragging
                  ? "gray.300"
                  : "gray.200"
              }
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
              <Text>
                {imageSrc ? (
                  "Image uploaded!"
                ) : (
                  <>
                    Click to upload image
                    <br />
                    or drag and drop the file
                  </>
                )}
              </Text>
            </Box>
          </Box>

          <Flex
            className="image-options"
            direction="column"
            alignItems="center"
            justifyContent="space-around"
            marginTop="20px"
            border="1px"
            borderRadius="5px"
            borderColor="gray.300"
            width="100%"
            maxWidth="450px"
            height="200px"
            padding="20px"
          >
            <Flex
              direction="row"
              alignItems="center"
              justifyContent="center"
              mb="10px"
            >
              <Flex alignItems="center" marginRight="10px">
                <Text marginRight={["2px", "5px"]}>Rows:</Text>
                <NumberInput
                  defaultValue={1}
                  min={1}
                  max={20}
                  size={["sm", "md"]}
                  onChange={handleRowsChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Flex>
              <Flex alignItems="center">
                <Text marginRight={["2px", "5px"]}>Cols:</Text>
                <NumberInput
                  defaultValue={3}
                  min={1}
                  max={20}
                  size={["sm", "md"]}
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
              mb="10px"
            >
              White stripes
            </Switch>

            {/* {stripesYes && ( */}
            <Flex alignItems="center" justifyContent="center" width="100%">
              <Text marginRight="5px">Stripe height (%): </Text>
              <NumberInput
                defaultValue={16}
                min={0}
                max={100}
                width="75px"
                height="40px"
                onChange={handleStripeHeightChange}
                isDisabled={!stripesYes}
              >
                <NumberInputField />
              </NumberInput>
            </Flex>
            {/* )} */}
          </Flex>

          <Button
            marginTop="25px"
            width="150px"
            isDisabled={!imageUploaded || loading}
            onClick={handleProcessClick}
          >
            {loading ? <Spinner /> : "Process image"}
          </Button>
        </Flex>

        {Object.keys(files).length > 0 && (
          <Text marginTop="25px">
            Tap to download image in full resolution, scroll down to find full
            resolution images or download a zip with all the images by clicking{" "}
            <Link href={zipUrl}>this link</Link>.
          </Text>
        )}

        {filesProcessed ? (
          <Flex
            direction="row"
            wrap="wrap"
            gap="4"
            marginTop="25px"
            justifyContent="center"
            background="gray.100"
            width="100%"
            padding={["2", "4"]}
          >
            {Object.keys(files).map((filename) => (
              <Box
                key={filename}
                gap="2"
                width={`calc(100% / ${columns} - 16px)`}
                height="auto"
              >
                <Link href={files[filename]} download={filename}>
                  <Image
                    src={files[filename]}
                    alt={filename}
                    width="100%"
                    height="auto"
                  />
                </Link>
              </Box>
            ))}
          </Flex>
        ) : (
          <></>
        )}

        <Flex direction="column" mt="4" width="100%">
          {Object.keys(files).map((filename) => (
            <Box key={filename} marginBottom="2" width="100%">
              <Image src={files[filename]} alt={filename} width="100%" />
            </Box>
          ))}
        </Flex>

        <Box
          className="footer"
          marginTop="25px"
          textAlign="center"
          width="100%"
        >
          <Text>
            Made by{" "}
            <Link
              href="https://janmatzek.github.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jan Matzek
            </Link>
          </Text>
        </Box>
      </Flex>
    </>
  );
}

export default App;
