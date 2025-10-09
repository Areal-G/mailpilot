# Homebrew Formula for Mail Pilot CLI

class MailPilot < Formula
  desc "CLI tool for setting up Mail Pilot - AI email assistant"
  homepage "https://www.mailpilot.app"
  version "2.30.0"
  license "AGPL-3.0-only"

  on_macos do
    on_arm do
      url "https://github.com/arealgizaw/mail-pilot/releases/download/v2.30.0/mail-pilot-darwin-arm64.tar.gz"
      sha256 "3c28de7d491f5dcff5828c9c611ce309740f4c277778752d3f4be083d39c4e96"

      def install
        bin.install "mail-pilot-darwin-arm64" => "mail-pilot"
      end
    end

    on_intel do
      url "https://github.com/arealgizaw/mail-pilot/releases/download/v2.30.0/mail-pilot-darwin-x64.tar.gz"
      sha256 "602b49d347e406b12111a711313a76b6f57e88b014485f412b7ffeb22f1203ab"

      def install
        bin.install "mail-pilot-darwin-x64" => "mail-pilot"
      end
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/arealgizaw/mail-pilot/releases/download/v2.30.0/mail-pilot-linux-x64.tar.gz"
      sha256 "ad2b34b5b1e12a3ea236d48ef1c4860e43fcac9818f2d60646d4c31ae4a38203"

      def install
        bin.install "mail-pilot-linux-x64" => "mail-pilot"
      end
    end
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/mail-pilot --version")
  end
end
