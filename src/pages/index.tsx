import {
  Input,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Button,
  FormHelperText,
  Link,
  Flex,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { SearchHistory } from "../components/SearchHistory";
import { addToStorageHistory, getHistory } from "../utils/localStorage";

// raider.io/characters/ length === 21
const URL_MINLENGTH = 21;

const validateUrl = (value: string) => {
  if (!value || value.length < URL_MINLENGTH) {
    return true;
  }

  const sanitized = value.startsWith("http") ? value : `https://${value}`;

  try {
    const url = new URL(sanitized);

    return (
      url.hostname === "raider.io" && url.pathname.includes("/characters/")
    );
  } catch {
    return false;
  }
};

export default function Index(): JSX.Element {
  const { push } = useRouter();
  const toast = useToast({
    status: "error",
    title: "Error",
    isClosable: true,
    position: "bottom",
    id: "error-toast",
  });

  const [value, setValue] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      const [region, realm, name] = new URL(value).pathname
        .replace("/characters/", "")
        .split("/");

      // eslint-disable-next-line no-console
      push(`/${region}/${realm}/${name}`)
        // eslint-disable-next-line promise/prefer-await-to-then
        .then((navigated) => {
          if (navigated) {
            addToStorageHistory({ region, realm, name });
          }
        })
        .catch(() => {
          toast({
            description: "Something went wrong! Please try again.",
          });
        });
    } catch {
      toast({
        description:
          "Could not extract parameters from URL. Are you sure this link is correct?",
      });
    }
  }

  const isValidUrl = validateUrl(value);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <FormControl id="text" isRequired isInvalid={!isValidUrl}>
            <FormLabel>Raider.io URL</FormLabel>

            <Flex>
              <Input
                type="text"
                value={value}
                onChange={handleChange}
                name="rio-url"
              />

              <Button
                type="submit"
                ml={2}
                disabled={!isValidUrl || value.length < URL_MINLENGTH}
              >
                Search
              </Button>
            </Flex>

            <FormErrorMessage>
              This does not appear to be a raider.io URL...
            </FormErrorMessage>

            <FormHelperText>
              Simply paste a Raider.io profile url, e.g.{" "}
              <Link
                href="https://raider.io/characters/eu/blackmoore/Xepheris"
                fontStyle="italic"
                target="_blank"
                rel="nooopener noreferrer"
                textDecoration="underline"
              >
                https://raider.io/characters/eu/blackmoore/Xepheris
              </Link>{" "}
              or check out{" "}
              <NextLink passHref href="/eu/blackmoore/xepheris">
                <Link fontStyle="italic" textDecoration="underline">
                  this demo
                </Link>
              </NextLink>
              .
            </FormHelperText>
          </FormControl>
        </fieldset>
      </form>
      <SearchHistory />
    </>
  );
}
