import frontImage from "../../assets/frontImage.png";

// Full-bleed, unfaded background image, sized to only the visible strip
// (see AuthLayout.tsx / the right-[...] values matching the form panel's
// width). object-cover's default center crop meant that on narrower
// desktop widths, the visible slice was cut symmetrically from both
// sides — chopping straight through the "TRACT" wordmark. Anchoring to
// the left edge instead keeps the emblem + wordmark + tagline always
// fully framed (since they sit on the left of the source image), and
// only crops further into the skyline on the right as the strip narrows.
export default function AuthLeftSide() {
  return (
    <div className="fixed inset-y-0 left-0 right-0 z-0 lg:right-[46%] xl:right-[40%] 2xl:right-[34%]">
      <img
        src={frontImage}
        alt="TRACT — Buy the best, skip the rest"
        className="h-full w-full object-cover object-left"
      />
    </div>
  );
}